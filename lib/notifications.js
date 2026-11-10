import { supabase } from "@/lib/supabase";

/**
 * Menghitung status peringatan berdasarkan start_date kegiatan:
 * 1. Abu-abu : Belum terkirim ke petugas (start_date masih > 24 jam atau belum diset)
 * 2. Merah   : 24 jam sebelum kegiatan (diffHours <= 24 && diffHours > 12)
 * 3. Kuning  : 12 jam sebelum kegiatan (diffHours <= 12 && diffHours > 0)
 * 4. Hijau   : Saat kegiatan berlangsung / sudah tiba (diffHours <= 0)
 */
export function getNotificationStatus(startDate) {
  if (!startDate) {
    return {
      key: "abu-abu",
      color: "gray",
      label: "Belum ada peringatan terkirim",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
      dotClass: "bg-gray-400",
      isSent: false,
      hoursLeft: null,
      getDynamicTitle: (title) => title || "Pemberitahuan",
    };
  }

  const now = new Date();
  const eventTime = new Date(startDate);
  const diffHours = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return {
      key: "hijau",
      color: "emerald",
      label: "Saat kegiatan berlangsung",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
      isSent: true,
      hoursLeft: diffHours,
      getDynamicTitle: (title) => `Saat ini ${title || "kegiatan"} sedang dilaksanakan`,
    };
  } else if (diffHours <= 12) {
    return {
      key: "kuning",
      color: "amber",
      label: "12 jam sebelum kegiatan",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
      isSent: true,
      hoursLeft: diffHours,
      getDynamicTitle: (title) => `12 jam lagi ${title || "kegiatan"} harus dilaksanakan`,
    };
  } else if (diffHours <= 24) {
    return {
      key: "merah",
      color: "rose",
      label: "24 jam sebelum kegiatan",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      isSent: true,
      hoursLeft: diffHours,
      getDynamicTitle: (title) => `24 jam lagi ${title || "kegiatan"} harus dilaksanakan`,
    };
  } else {
    return {
      key: "abu-abu",
      color: "gray",
      label: "Belum ada peringatan terkirim",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
      dotClass: "bg-gray-400",
      isSent: false,
      hoursLeft: diffHours,
      getDynamicTitle: (title) => title || "Pemberitahuan",
    };
  }
}

/**
 * Format selang waktu relatif (e.g. "Baru saja", "5 menit lalu", "2 jam lalu")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return "-";
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 45) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return past.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Ambil daftar notifikasi yang telah DIBACA oleh PETUGAS (Tour Leader / Muthawif).
 * Format judul: 'Muthawif/Tour Leader [Nama] telah membaca notif [Judul Notif]'
 */
export async function fetchPetugasReadNotifications(limit = 30) {
  try {
    const { data, error } = await supabase
      .from("notification_recipients")
      .select(
        `
        id,
        is_read,
        read_at,
        created_at,
        profiles:user_id!inner(id, username, email, role),
        notifications:notification_id!inner(id, title, message, start_date, end_date)
      `
      )
      .eq("is_read", true)
      .in("profiles.role", ["tour_leader", "muthawif"])
      .order("read_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data
      .map((item) => {
        const profile = item.profiles;
        const notif = item.notifications;
        if (!profile || !notif) return null;

        const roleLabel =
          profile.role === "tour_leader"
            ? "Tour Leader"
            : profile.role === "muthawif"
            ? "Muthawif"
            : profile.role;

        const petugasName = profile.username || profile.email || "Petugas";
        const notifTitle = notif.title || "Notifikasi";

        return {
          id: item.id,
          title: `${roleLabel} ${petugasName} telah membaca notif ${notifTitle}`,
          desc: notif.message || `Notifikasi "${notifTitle}" telah dibaca oleh ${roleLabel} ${petugasName}`,
          time: formatTimeAgo(item.read_at || item.created_at),
          unread: true,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Gagal mengambil notifikasi baca petugas:", err);
    return [];
  }
}

/**
 * Ambil daftar notifikasi yang ditujukan khusus untuk user yang sedang login.
 */
export async function fetchUserNotifications(userId, onlySent = true) {
  if (!userId) return [];
  try {
    const { data: recipients, error: recipError } = await supabase
      .from("notification_recipients")
      .select("id, notification_id, user_id, is_read, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (recipError) throw recipError;
    if (!recipients || recipients.length === 0) return [];

    const notifIds = Array.from(
      new Set(recipients.map((r) => r.notification_id).filter(Boolean))
    );
    if (notifIds.length === 0) return [];

    const { data: notifData, error: notifError } = await supabase
      .from("notifications")
      .select("id, title, message, type, start_date, end_date, created_at")
      .in("id", notifIds);

    if (notifError) throw notifError;

    const notifMap = new Map((notifData || []).map((n) => [n.id, n]));

    const list = recipients
      .map((r) => {
        const notif = notifMap.get(r.notification_id);
        if (!notif) return null;

        const statusInfo = getNotificationStatus(notif.start_date);
        const dynamicTitle = statusInfo.getDynamicTitle(notif.title);

        return {
          recipientId: r.id,
          notificationId: notif.id,
          originalTitle: notif.title,
          dynamicTitle: dynamicTitle,
          message: notif.message,
          type: notif.type,
          startDate: notif.start_date,
          endDate: notif.end_date,
          createdAt: r.created_at || notif.created_at,
          isRead: Boolean(r.is_read),
          readAt: r.read_at,
          status: statusInfo,
        };
      })
      .filter(Boolean);

    if (onlySent) {
      return list.filter((item) => item.status.isSent);
    }

    return list;
  } catch (err) {
    console.error("Gagal mengambil notifikasi user:", err);
    return [];
  }
}

/**
 * Tandai satu notifikasi sebagai sudah dibaca
 */
export async function markNotificationAsRead(recipientId) {
  if (!recipientId) return false;
  try {
    const { error } = await supabase
      .from("notification_recipients")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", recipientId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Gagal memperbarui status baca notifikasi:", err);
    return false;
  }
}

/**
 * Tandai semua notifikasi milik user sebagai sudah dibaca
 */
export async function markAllNotificationsAsRead(userId) {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from("notification_recipients")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Gagal menandai semua notifikasi dibaca:", err);
    return false;
  }
}
