"use client";
import React, { useState, useEffect } from "react";
import Topbar from "@/app/components/Topbar";
import PageHeader from "@/app/components/PageHeader";
import {
  FaClipboardCheck,
  FaUserTie,
  FaUsers,
  FaUserCog,
  FaEye,
  FaPen,
  FaTrash,
  FaChartBar,
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaInbox,
  FaSearch,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaRegQuestionCircle,
  FaRegCalendarTimes,
  FaHistory,
  FaFileAlt,
  FaArrowRight,
  FaPlus,
} from "react-icons/fa";
import { FaUserGraduate } from "react-icons/fa6";
import { PlusIcon } from "@/app/components/CustomIcons";

import { createCeklisAction, updateCeklisAction } from "../actions/ceklis";
import { supabase } from "@/lib/supabase";

export default function TugasCeklisPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [view, setView] = useState(0); // 0: List, 1: Form (Tambah/Edit), 2: Hasil Tugas, 3: Pilihan Buat Baru / Riwayat
  const [loading, setLoading] = useState(false);
  const [tourLeaders, setTourLeaders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // State khusus untuk Halaman Hasil
  const [selectedTaskResult, setSelectedTaskResult] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState([]);

  // State Form & Pengingat Status Lama
  const [selectedTarget, setSelectedTarget] = useState("all_tour_leader");
  const [taskForm, setTaskForm] = useState({
    title: "",
    opensAt: "",
    closesAt: "",
  });
  const [questions, setQuestions] = useState([{ text: "" }]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [originalAssignments, setOriginalAssignments] = useState([]);

  // State Pop-up Modal Detail Tugas & Status Penyelesaian
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);

  // State "Pengguna Tertentu" Tambahan
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKloterFilter, setSelectedKloterFilter] = useState("all");

  // State Toggle Riwayat
  const [showHistoryList, setShowHistoryList] = useState(false);

  // 1. Fetch Logged In User
  useEffect(() => {
    const fetchAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
      setIsUserLoaded(true);
    };
    fetchAuth();
  }, []);

  // Periksa apakah user login adalah admin (bukan TL / Muthawif)
  const isAdmin =
    currentUser &&
    currentUser.role !== "tour_leader" &&
    currentUser.role !== "muthawif";

  // Fetch Data Petugas
  useEffect(() => {
    const fetchData = async () => {
      const { data: petugasData, error } = await supabase
        .from("profiles")
        .select("id, username, role, kloter_id, kloter(name)")
        .in("role", ["tour_leader", "muthawif"]);

      if (petugasData) {
        setTourLeaders(petugasData);
        const defaultTL = petugasData
          .filter((p) => p.role === "tour_leader")
          .map((p) => p.id);
        setSelectedRecipients(defaultTL);
      }
      if (error) console.error("Gagal menarik data petugas:", error.message);
    };
    fetchData();
  }, []);

  // Fetch Data Daftar Tugas
  useEffect(() => {
    if (view === 0 && isUserLoaded) {
      fetchTasks();
    }
  }, [view, isUserLoaded, currentUser]);

  const fetchTasks = async () => {
    let tasksData = [];
    let taskError = null;

    if (isAdmin) {
      // Jika Admin, tarik semua tugas
      const { data, error } = await supabase
        .from("checklist_tasks")
        .select("id, title, opens_at, closes_at, created_at")
        .order("created_at", { ascending: false });

      tasksData = data;
      taskError = error;
    } else {
      // Jika Tour Leader / Muthawif, tarik tugas dan status dari assignment
      const { data, error } = await supabase
        .from("checklist_assignments")
        .select(
          `
          status,
          checklist_tasks (
            id, title, opens_at, closes_at, created_at
          )
        `,
        )
        .eq("recipient_id", currentUser?.id);

      taskError = error;

      if (data) {
        // Ekstrak data dan masukkan personal_status
        const extractedTasks = data
          .map((a) => {
            const t = Array.isArray(a.checklist_tasks)
              ? a.checklist_tasks[0]
              : a.checklist_tasks;
            if (t) {
              t.personal_status = a.status; // Simpan status personal user ke objek task
            }
            return t;
          })
          .filter((t) => t != null);

        const uniqueTasksMap = new Map();
        extractedTasks.forEach((t) => uniqueTasksMap.set(t.id, t));
        tasksData = Array.from(uniqueTasksMap.values());

        tasksData.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      }
    }

    if (taskError) {
      console.error("Gagal menarik data tugas:", taskError.message);
      return;
    }

    if (!tasksData || tasksData.length === 0) {
      setTasks([]);
      return;
    }

    const { data: allQuestions, error: qError } = await supabase
      .from("checklist_questions")
      .select("*")
      .order("sort_order", { ascending: true });

    if (qError) {
      console.error("Gagal menarik data soal:", qError.message);
    }

    const formattedTasks = tasksData.map((task) => {
      const taskQuestions = allQuestions
        ? allQuestions.filter((q) => q.task_id === task.id)
        : [];

      return {
        ...task,
        checklist_questions: taskQuestions,
      };
    });

    setTasks(formattedTasks);
  };

  // Helper Ambil Recipient Tugas dari Database
  const fetchTaskAssignments = async (taskId) => {
    const { data, error } = await supabase
      .from("checklist_assignments")
      .select("recipient_id, status")
      .eq("task_id", taskId);

    if (error) {
      console.error("Gagal mengambil penugasan:", error.message);
      return [];
    }

    return data || [];
  };

  // Handler Buka Detail & Cek Status Penyelesaian User
  const handleOpenDetail = async (task) => {
    setSelectedTaskDetail(task);

    if (!isAdmin && currentUser) {
      const { data } = await supabase
        .from("checklist_assignments")
        .select("status")
        .eq("task_id", task.id)
        .eq("recipient_id", currentUser.id)
        .maybeSingle();

      setIsTaskCompleted(
        data?.status === "completed" || data?.status === "submitted",
      );
    }
  };

  // Handler Tombol Tandai Selesai (Khusus TL / Muthawif)
  const handleMarkDone = async () => {
    if (!currentUser) return;
    setMarkingDone(true);

    const { error } = await supabase
      .from("checklist_assignments")
      .update({ status: "completed" })
      .eq("task_id", selectedTaskDetail.id)
      .eq("recipient_id", currentUser.id);

    if (error) {
      alert("Gagal menandai tugas selesai: " + error.message);
    } else {
      setIsTaskCompleted(true);
      alert("Tugas berhasil ditandai selesai!");

      // Update UI List seketika menjadi hijau tanpa harus refresh halaman
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === selectedTaskDetail.id
            ? { ...t, personal_status: "completed" }
            : t,
        ),
      );
    }
    setMarkingDone(false);
  };

  // Handler Buka Opsi Pembuatan Tugas
  const handleOpenCreateOptions = () => {
    setShowHistoryList(false);
    setView(3);
  };

  // Handler Buka Form Tugas Kosong Baru
  const handleCreateNew = () => {
    setEditingTaskId(null);
    setTaskForm({ title: "", opensAt: "", closesAt: "" });
    setQuestions([{ text: "" }]);
    setSelectedTarget("all_tour_leader");
    setOriginalAssignments([]);
    const defaultTL = tourLeaders
      .filter((p) => p.role === "tour_leader")
      .map((p) => p.id);
    setSelectedRecipients(defaultTL);
    setSearchQuery("");
    setSelectedKloterFilter("all");
    setView(1);
  };

  // Handler Load Tugas dari Riwayat
  const handleLoadFromHistory = async (task) => {
    setEditingTaskId(null);
    setTaskForm({
      title: task.title || "",
      opensAt: "",
      closesAt: "",
    });
    setSearchQuery("");
    setSelectedKloterFilter("all");
    setOriginalAssignments([]);

    const { data: qData } = await supabase
      .from("checklist_questions")
      .select("*")
      .eq("task_id", task.id)
      .order("sort_order", { ascending: true });

    if (qData && qData.length > 0) {
      setQuestions(
        qData.map((q) => ({
          text: q.question_text || q.text || "",
        })),
      );
    } else {
      setQuestions([{ text: "" }]);
    }

    const rawAssignments = await fetchTaskAssignments(task.id);
    const assignedIds = rawAssignments.map((a) => a.recipient_id);
    setSelectedRecipients(assignedIds);

    const allTLIds = tourLeaders
      .filter((p) => p.role === "tour_leader")
      .map((p) => p.id);
    const allMuthawifIds = tourLeaders
      .filter((p) => p.role === "muthawif")
      .map((p) => p.id);

    const isOnlyMuthawif =
      allMuthawifIds.length > 0 &&
      assignedIds.length === allMuthawifIds.length &&
      allMuthawifIds.every((id) => assignedIds.includes(id));

    const isOnlyTL =
      allTLIds.length > 0 &&
      assignedIds.length === allTLIds.length &&
      allTLIds.every((id) => assignedIds.includes(id));

    const isAllUsers =
      tourLeaders.length > 0 &&
      assignedIds.length === tourLeaders.length &&
      tourLeaders.every((p) => assignedIds.includes(p.id));

    if (isOnlyMuthawif) {
      setSelectedTarget("all_muthawif");
    } else if (isOnlyTL) {
      setSelectedTarget("all_tour_leader");
    } else if (isAllUsers) {
      setSelectedTarget("all_petugas");
    } else {
      setSelectedTarget("custom");
    }

    setView(1);
  };

  // Handler Buka Mode Edit
  const handleOpenEdit = async (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || "",
      opensAt: task.opens_at ? task.opens_at.slice(0, 16) : "",
      closesAt: task.closes_at ? task.closes_at.slice(0, 16) : "",
    });
    setSearchQuery("");
    setSelectedKloterFilter("all");

    const { data: qData } = await supabase
      .from("checklist_questions")
      .select("*")
      .eq("task_id", task.id)
      .order("sort_order", { ascending: true });

    if (qData && qData.length > 0) {
      setQuestions(
        qData.map((q) => ({
          text: q.question_text || q.text || "",
        })),
      );
    } else {
      setQuestions([{ text: "" }]);
    }

    const rawAssignments = await fetchTaskAssignments(task.id);
    setOriginalAssignments(rawAssignments);
    const assignedIds = rawAssignments.map((a) => a.recipient_id);
    setSelectedRecipients(assignedIds);

    const allTLIds = tourLeaders
      .filter((p) => p.role === "tour_leader")
      .map((p) => p.id);
    const allMuthawifIds = tourLeaders
      .filter((p) => p.role === "muthawif")
      .map((p) => p.id);

    const isOnlyMuthawif =
      allMuthawifIds.length > 0 &&
      assignedIds.length === allMuthawifIds.length &&
      allMuthawifIds.every((id) => assignedIds.includes(id));

    const isOnlyTL =
      allTLIds.length > 0 &&
      assignedIds.length === allTLIds.length &&
      allTLIds.every((id) => assignedIds.includes(id));

    const isAllUsers =
      tourLeaders.length > 0 &&
      assignedIds.length === tourLeaders.length &&
      tourLeaders.every((p) => assignedIds.includes(p.id));

    if (isOnlyMuthawif) {
      setSelectedTarget("all_muthawif");
    } else if (isOnlyTL) {
      setSelectedTarget("all_tour_leader");
    } else if (isAllUsers) {
      setSelectedTarget("all_petugas");
    } else {
      setSelectedTarget("custom");
    }

    setView(1);
  };

  // Handler Buka Halaman Hasil
  const handleOpenResult = async (task) => {
    setSelectedTaskResult(task);
    const rawAssignments = await fetchTaskAssignments(task.id);
    setAssignmentsData(rawAssignments);
    setView(2);
  };

  // Handler Hapus Tugas
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    await supabase.from("checklist_questions").delete().eq("task_id", taskId);
    await supabase.from("checklist_assignments").delete().eq("task_id", taskId);

    const { error } = await supabase
      .from("checklist_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      alert("Gagal menghapus tugas: " + error.message);
      return;
    }

    alert("Tugas berhasil dihapus.");
    fetchTasks();
  };

  const handleTargetSelection = (targetVal) => {
    setSelectedTarget(targetVal);
    if (targetVal === "all_tour_leader") {
      setSelectedRecipients(
        tourLeaders.filter((p) => p.role === "tour_leader").map((p) => p.id),
      );
    } else if (targetVal === "all_muthawif") {
      setSelectedRecipients(
        tourLeaders.filter((p) => p.role === "muthawif").map((p) => p.id),
      );
    } else if (targetVal === "all_petugas") {
      setSelectedRecipients(tourLeaders.map((p) => p.id));
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].text = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => setQuestions([...questions, { text: "" }]);

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      alert("Minimal harus ada 1 soal!");
      return;
    }
    const newQuestions = questions.filter((_, idx) => idx !== index);
    setQuestions(newQuestions);
  };

  // FUNGSI INI DITAMBAHKAN PARAMETER isDone
  const getTaskStatusInfo = (opensAt, closesAt, isDone = false) => {
    const now = new Date().getTime();
    const openTime = opensAt ? new Date(opensAt).getTime() : 0;
    const closeTime = closesAt ? new Date(closesAt).getTime() : 0;

    if (now < openTime) {
      return {
        label: "Belum dibuka",
        badgeBg: "bg-slate-100 text-slate-600 border border-slate-200",
        dotBg: "bg-slate-400",
        accentBorder: "border-l-4 border-l-slate-300",
      };
    } else if (now >= openTime && now <= closeTime) {
      // Jika Sedang Dibuka tapi SUDAH SELESAI, override warna ke Hijau
      if (isDone) {
        return {
          label: "Sedang dibuka",
          badgeBg:
            "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
          dotBg: "bg-emerald-500",
          accentBorder: "border-l-4 border-l-emerald-500",
        };
      }
      return {
        label: "Sedang dibuka",
        badgeBg: "bg-amber-50 text-amber-700 border border-amber-200/80",
        dotBg: "bg-[#eab308]",
        accentBorder: "border-l-4 border-l-[#eab308]",
      };
    } else {
      if (isDone) {
        return {
          label: "Sudah ditutup",
          badgeBg:
            "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
          dotBg: "bg-emerald-500",
          accentBorder: "border-l-4 border-l-emerald-500",
        };
      }
      return {
        label: "Sudah ditutup",
        badgeBg: "bg-slate-100 text-slate-500 border border-slate-200/60",
        dotBg: "bg-slate-400",
        accentBorder: "border-l-4 border-l-slate-300",
      };
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const dayMonthYear = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const time = d
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(".", ":");
    return `${dayMonthYear} · ${time}`;
  };

  const handleSubmitTugas = async () => {
    setLoading(true);
    const validQuestions = questions.filter((q) => q.text.trim() !== "");

    if (!taskForm.title.trim() || !taskForm.opensAt || !taskForm.closesAt) {
      alert("Judul, Waktu Buka, dan Waktu Tutup harus diisi!");
      setLoading(false);
      return;
    }

    const openTime = new Date(taskForm.opensAt).getTime();
    const closeTime = new Date(taskForm.closesAt).getTime();

    if (closeTime <= openTime) {
      alert("Error: Waktu Tutup harus lebih lama dari Waktu Buka!");
      setLoading(false);
      return;
    }

    if (selectedRecipients.length === 0) {
      alert("Pilih minimal 1 orang penerima tugas!");
      setLoading(false);
      return;
    }

    if (validQuestions.length === 0) {
      alert("Daftar soal tidak boleh kosong!");
      setLoading(false);
      return;
    }

    const recipientsPayload = selectedRecipients.map((id) => {
      const existingAssignment = originalAssignments.find(
        (a) => a.recipient_id === id,
      );
      return {
        recipient_id: id,
        status: existingAssignment ? existingAssignment.status : "assigned",
      };
    });

    if (editingTaskId) {
      const result = await updateCeklisAction(
        editingTaskId,
        taskForm,
        validQuestions,
        recipientsPayload,
      );

      if (!result.success) {
        alert("Gagal memperbarui tugas: " + result.error);
        setLoading(false);
        return;
      }

      alert("Tugas berhasil diperbarui!");
    } else {
      const result = await createCeklisAction(
        taskForm,
        validQuestions,
        recipientsPayload,
      );

      if (!result.success) {
        alert("Error: " + result.error);
        setLoading(false);
        return;
      }

      alert("Tugas berhasil dibuat dan dikirim ke petugas!");
    }

    setTaskForm({ title: "", opensAt: "", closesAt: "" });
    setQuestions([{ text: "" }]);
    setOriginalAssignments([]);
    setEditingTaskId(null);
    setLoading(false);
    setView(0);
  };

  const uniqueKloters = Array.from(
    new Map(
      tourLeaders
        .filter((p) => p.kloter_id && p.kloter)
        .map((p) => [p.kloter_id, { id: p.kloter_id, name: p.kloter.name }]),
    ).values(),
  );

  const getFilteredUsers = (role) => {
    return tourLeaders.filter((p) => {
      const matchRole = p.role === role;
      const matchSearch = p.username
        ? p.username.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      const matchKloter =
        selectedKloterFilter === "all" || p.kloter_id === selectedKloterFilter;

      return matchRole && matchSearch && matchKloter;
    });
  };

  const filteredTLs = getFilteredUsers("tour_leader");
  const filteredMuthawifs = getFilteredUsers("muthawif");

  const handleSelectAllFiltered = () => {
    const visibleIds = [...filteredTLs, ...filteredMuthawifs].map((p) => p.id);
    setSelectedRecipients((prev) => {
      const combined = new Set([...prev, ...visibleIds]);
      return Array.from(combined);
    });
  };

  const handleDeselectAllFiltered = () => {
    const visibleIds = [...filteredTLs, ...filteredMuthawifs].map((p) => p.id);
    setSelectedRecipients((prev) =>
      prev.filter((id) => !visibleIds.includes(id)),
    );
  };

  const assignedRecipientIds = assignmentsData.map((a) => a.recipient_id);

  const assignedTourLeaders = tourLeaders
    .filter(
      (p) => p.role === "tour_leader" && assignedRecipientIds.includes(p.id),
    )
    .map((p) => {
      const assignInfo = assignmentsData.find((a) => a.recipient_id === p.id);
      return { ...p, status: assignInfo?.status || "pending" };
    });

  const assignedMuthawif = tourLeaders
    .filter((p) => p.role === "muthawif" && assignedRecipientIds.includes(p.id))
    .map((p) => {
      const assignInfo = assignmentsData.find((a) => a.recipient_id === p.id);
      return { ...p, status: assignInfo?.status || "pending" };
    });

  const totalAssigned = assignmentsData.length;
  const totalSelesai = assignmentsData.filter(
    (a) => a.status === "completed" || a.status === "submitted",
  ).length;

  const tlSelesai = assignedTourLeaders.filter(
    (p) => p.status === "completed" || p.status === "submitted",
  ).length;

  const muthawifSelesai = assignedMuthawif.filter(
    (p) => p.status === "completed" || p.status === "submitted",
  ).length;

  if (!isUserLoaded) {
    return (
      <div className="w-full bg-[#f8fafc] h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] h-screen overflow-hidden flex flex-col relative font-sans">
      <Topbar
        title="Tugas Ceklis"
        breadcrumbs={["Dashboard", "Tugas Ceklis"]}
      />
      <div className="flex-1 overflow-y-auto p-10 w-full max-w-5xl no-scrollbar mx-auto">
        {/* VIEW 0: LIST VIEW */}
        {view === 0 && (
          <div>
            <PageHeader
              title="Daftar Tugas Ceklis"
              description="Berisi daftar tugas ceklis yang harus dikerjakan oleh petugas."
              icon={
                <FaClipboardCheck className="w-[26px] h-[26px] text-[#eab308]" />
              }
              buttonText={isAdmin ? "Tambah Tugas Ceklis" : undefined}
              buttonIcon={isAdmin ? <PlusIcon /> : undefined}
              buttonOnClick={isAdmin ? handleOpenCreateOptions : undefined}
            />

            <div className="mt-8 space-y-4">
              {tasks.length === 0 ? (
                <div className="text-gray-500 text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                  Belum ada tugas yang diberikan.
                </div>
              ) : (
                tasks.map((task) => {
                  // Cek apakah user telah menandai tugas sebagai selesai
                  const isDone =
                    !isAdmin &&
                    (task.personal_status === "completed" ||
                      task.personal_status === "submitted");
                  const statusInfo = getTaskStatusInfo(
                    task.opens_at,
                    task.closes_at,
                    isDone,
                  );

                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 flex justify-between items-center hover:border-[#1B3167] transition-all ${statusInfo.accentBorder}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900 tracking-tight">
                            {task.title}
                          </h3>

                          {/* Lencana Status Waktu (Berubah Hijau jika Selesai) */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeBg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotBg}`}
                            ></span>
                            {statusInfo.label}
                          </span>

                          {/* INDIKATOR STATUS KHUSUS UNTUK TL/MUTHAWIF */}
                          {!isAdmin && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                isDone
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {isDone ? (
                                <FaCheckCircle className="text-emerald-500" />
                              ) : (
                                <FaClock className="text-slate-400" />
                              )}
                              {isDone ? "Sudah dikerjakan" : "Belum dikerjakan"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <FaRegCalendarAlt className="text-slate-400 text-sm" />
                            {formatDateDisplay(task.opens_at)}
                          </span>
                          <span className="text-slate-400 font-normal">→</span>
                          <span className="flex items-center gap-1.5">
                            <FaRegCalendarTimes className="text-slate-400 text-sm" />
                            {formatDateDisplay(task.closes_at)}
                          </span>
                          <span className="text-slate-300 mx-0.5">|</span>
                          <span className="flex items-center gap-1.5">
                            <FaRegQuestionCircle className="text-slate-400 text-sm" />
                            {task.checklist_questions?.length || 0} soal
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center flex-wrap justify-end">
                        <button
                          onClick={() => handleOpenDetail(task)}
                          className="px-3.5 py-2 text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                        >
                          <FaEye /> Detail Soal
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(task)}
                              className="px-3.5 py-2 text-xs font-bold bg-white text-[#111c2e] border border-[#111c2e]/20 rounded-xl hover:bg-[#111c2e]/5 flex items-center gap-1.5 transition-colors"
                            >
                              <FaPen className="w-3 h-3 text-[#eab308]" /> Edit
                            </button>
                            <button
                              onClick={() => handleOpenResult(task)}
                              className="px-3.5 py-2 text-xs font-bold bg-[#1B3167] text-white rounded-xl hover:bg-[#1e2e46] flex items-center gap-1.5 transition-colors"
                            >
                              <FaChartBar className="w-3 h-3 text-[#facc15]" />{" "}
                              Hasil
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-3.5 py-2 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100/50 flex items-center gap-1.5 transition-colors"
                            >
                              <FaTrash className="w-3 h-3" /> Hapus
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: OPSI PEMBUATAN TUGAS (BARU / RIWAYAT) */}
        {view === 3 && isAdmin && (
          <div className="bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-8 space-y-8">
            <div className="bg-[#1B3167] border-2 border-black/10 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <FaPlus className="text-2xl text-[#facc15]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 text-white px-2.5 py-1 rounded-md">
                    Opsi Pembuatan
                  </span>
                  <h1 className="text-3xl font-bold mt-2">
                    Tambah Tugas Ceklis
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setView(0)}
                className="bg-black/30 border border-[#1B3167] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/90 flex items-center gap-2 transition-colors shadow-sm"
              >
                <FaArrowLeft /> Kembali
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={handleCreateNew}
                className="p-8 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center hover:border-[#1B3167] hover:bg-slate-50 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:bg-[#1B3167] group-hover:text-white rounded-full flex items-center justify-center text-2xl mb-4 transition-all">
                  <FaFileAlt />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Buat Tugas Baru
                </h3>
                <p className="text-sm text-slate-500 px-4">
                  Mulai dari awal dengan formulir kosong. Anda akan mengatur
                  semuanya dari nol.
                </p>
              </button>

              <button
                onClick={() => setShowHistoryList(!showHistoryList)}
                disabled={tasks.length === 0}
                className={`p-8 border-2 border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center transition-all group ${tasks.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:border-[#eab308] hover:bg-amber-50"}`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 transition-all ${tasks.length === 0 ? "bg-slate-100 text-slate-400" : "bg-amber-100 text-amber-600 group-hover:bg-[#eab308] group-hover:text-white"}`}
                >
                  <FaHistory />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Pilih dari Riwayat
                </h3>
                <p className="text-sm text-slate-500 px-4">
                  {tasks.length === 0
                    ? "Belum ada riwayat tugas ceklis yang pernah dibuat sebelumnya."
                    : "Gunakan pengaturan, daftar soal, dan sasaran dari tugas sebelumnya."}
                </p>
              </button>
            </div>

            {showHistoryList && tasks.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Pilih Tugas Sebelumnya
                </h3>
                <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center hover:border-[#1B3167] transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <FaRegQuestionCircle className="text-slate-400" />{" "}
                          {task.checklist_questions?.length || 0} soal
                        </p>
                      </div>
                      <button
                        onClick={() => handleLoadFromHistory(task)}
                        className="px-4 py-2 bg-[#1B3167] text-white text-xs font-bold rounded-lg hover:bg-[#152654] transition-all flex items-center gap-2"
                      >
                        Gunakan ini <FaArrowRight />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 1: FORM VIEW (Tambah / Edit) */}
        {view === 1 && isAdmin && (
          <div className="bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-100 p-8 space-y-8">
            <div className="bg-[#1B3167] border-2 border-black/10 text-white p-6 rounded-2xl shadow-sm flex items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <FaClipboardCheck className="text-2xl text-[#facc15]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 text-white px-2.5 py-1 rounded-md">
                    Formulir Pengaturan
                  </span>
                  <h1 className="text-3xl font-bold mt-2">
                    {editingTaskId
                      ? "Edit Tugas Ceklis"
                      : "Tambah Tugas Ceklis"}
                  </h1>
                </div>
              </div>
            </div>

            {/* BAGIAN 1: INFORMASI TUGAS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#1B3167] text-white px-5 py-4 font-bold flex items-center gap-3 border-b border-slate-200">
                <span className="bg-[#facc15]/20 text-[#facc15] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                Informasi Tugas
              </div>
              <div className="p-6 space-y-5 bg-white">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                    Judul Tugas *
                  </label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    placeholder="Contoh: Ceklis Persiapan Keberangkatan Umroh"
                    className="w-full placeholder:text-gray-500 text-gray-900 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#eab308] focus:border-[#eab308] outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Waktu Buka *
                    </label>
                    <input
                      type="datetime-local"
                      value={taskForm.opensAt}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          opensAt: e.target.value,
                        })
                      }
                      className="w-full border text-gray-900 border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#eab308] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Waktu Tutup *
                    </label>
                    <input
                      type="datetime-local"
                      value={taskForm.closesAt}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          closesAt: e.target.value,
                        })
                      }
                      className="w-full border text-gray-900 border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#eab308] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN 2: PENERIMA TUGAS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#1B3167] text-white px-5 py-4 font-bold flex items-center gap-3 border-b border-slate-200">
                <span className="bg-[#facc15]/20 text-[#facc15] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                Penerima Tugas
              </div>
              <div className="p-6 bg-white">
                <label className="block text-xs font-bold text-slate-600 mb-4 uppercase tracking-wide">
                  Kirim Tugas Ke *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleTargetSelection("all_tour_leader")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${selectedTarget === "all_tour_leader" ? "border-[#111c2e] bg-slate-50 text-[#111c2e] font-semibold ring-1 ring-[#111c2e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FaUserTie className="text-2xl text-[#eab308]" />
                    <span className="text-xs font-bold">Semua Tour Leader</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetSelection("all_muthawif")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${selectedTarget === "all_muthawif" ? "border-[#111c2e] bg-slate-50 text-[#111c2e] font-semibold ring-1 ring-[#111c2e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FaUserGraduate className="text-2xl text-[#eab308]" />
                    <span className="text-xs font-bold">Semua Muthawif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetSelection("all_petugas")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${selectedTarget === "all_petugas" ? "border-[#111c2e] bg-slate-50 text-[#111c2e] font-semibold ring-1 ring-[#111c2e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FaUsers className="text-2xl text-[#eab308]" />
                    <span className="text-xs font-bold">Semua Pengguna</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetSelection("custom")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${selectedTarget === "custom" ? "border-[#111c2e] bg-slate-50 text-[#111c2e] font-semibold ring-1 ring-[#111c2e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <FaUserCog className="text-2xl text-[#eab308]" />
                    <span className="text-xs font-bold">Pengguna Tertentu</span>
                  </button>
                </div>

                {selectedTarget === "custom" && (
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <FaSearch size={14} />
                        </span>
                        <input
                          type="text"
                          placeholder="Cari nama pengguna..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full placeholder:text-gray-500 text-gray-900 pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#111c2e] focus:border-[#111c2e] outline-none"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <FaMapMarkerAlt size={14} />
                        </span>
                        <select
                          value={selectedKloterFilter}
                          onChange={(e) =>
                            setSelectedKloterFilter(e.target.value)
                          }
                          className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#111c2e] focus:border-[#111c2e] outline-none appearance-none"
                        >
                          <option value="all">Semua Kloter</option>
                          {uniqueKloters.map((kl) => (
                            <option key={kl.id} value={kl.id}>
                              {kl.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllFiltered}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
                        >
                          ✓ Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAllFiltered}
                          className="px-3 py-1 bg-slate-200 border border-slate-300 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-300 transition-colors flex items-center gap-1"
                        >
                          ✕ Hapus Semua
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {selectedRecipients.length} dipilih
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="bg-[#1B3167] px-4 py-4 border-b border-slate-100 flex justify-between items-center font-bold text-xs">
                          <span className="flex items-center gap-2 text-white">
                            <FaUserTie className="text-[#eab308]" /> Tour Leader
                          </span>
                          <span className="bg-[#111c2e] text-[#facc15] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                            {filteredTLs.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                          {filteredTLs.length === 0 ? (
                            <p className="text-center py-6 text-xs text-slate-400">
                              Tidak ada Tour Leader yang cocok.
                            </p>
                          ) : (
                            filteredTLs.map((tl) => (
                              <label
                                key={tl.id}
                                className="flex items-center gap-3.5 p-3 hover:bg-slate-50 cursor-pointer w-full group transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecipients.includes(tl.id)}
                                  onChange={() => handleCheckboxChange(tl.id)}
                                  className="w-4 h-4 text-[#111c2e] border-slate-300 rounded focus:ring-[#eab308]"
                                />
                                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100/55 flex items-center justify-center text-[#111c2e] transition-colors">
                                  <FaUserTie
                                    size={14}
                                    className="text-[#111c2e]"
                                  />
                                </div>
                                <div className="leading-tight">
                                  <span className="text-xs font-bold block text-slate-800">
                                    {tl.username || "Tanpa Nama"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <FaMapMarkerAlt
                                      className="text-slate-400"
                                      size={10}
                                    />{" "}
                                    {tl.kloter?.name || "Belum ada kloter"}
                                  </span>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="bg-[#1B3167] px-4 py-4 border-b border-slate-100 flex justify-between items-center font-bold text-xs">
                          <span className="flex items-center gap-2 text-white">
                            <FaUserGraduate className="text-[#eab308]" />{" "}
                            Muthawif
                          </span>
                          <span className="bg-[#111c2e] text-[#facc15] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                            {filteredMuthawifs.length}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                          {filteredMuthawifs.length === 0 ? (
                            <p className="text-center py-6 text-xs text-slate-400">
                              Tidak ada Muthawif yang cocok.
                            </p>
                          ) : (
                            filteredMuthawifs.map((m) => (
                              <label
                                key={m.id}
                                className="flex items-center gap-3.5 p-3 hover:bg-slate-50 cursor-pointer w-full group transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecipients.includes(m.id)}
                                  onChange={() => handleCheckboxChange(m.id)}
                                  className="w-4 h-4 text-[#111c2e] border-slate-300 rounded focus:ring-[#eab308]"
                                />
                                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-amber-100/55 flex items-center justify-center text-[#111c2e] transition-colors">
                                  <FaUserGraduate
                                    size={14}
                                    className="text-[#111c2e]"
                                  />
                                </div>
                                <div className="leading-tight">
                                  <span className="text-xs font-bold block text-slate-800">
                                    {m.username || "Tanpa Nama"}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <FaMapMarkerAlt
                                      className="text-slate-400"
                                      size={10}
                                    />{" "}
                                    {m.kloter?.name || "Belum ada kloter"}
                                  </span>
                                </div>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BAGIAN 3: DAFTAR SOAL */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#1B3167] text-white px-5 py-4 font-bold flex justify-between items-center border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="bg-[#facc15]/20 text-[#facc15] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    3
                  </span>
                  Daftar Soal
                  <span className="bg-slate-100/10 text-gray-400 border border-gray-500 text-[11px] px-2 py-0.5 rounded-full ml-2">
                    {questions.length} Soal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="border border-[#facc15]/50 text-[#facc15] hover:bg-[#facc15]/10 bg-[#facc15]/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-all"
                >
                  + Tambah Soal
                </button>
              </div>
              <div className="p-6 bg-white space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-600">
                        Soal {idx + 1} *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) =>
                        handleQuestionChange(idx, e.target.value)
                      }
                      placeholder="Masukkan isi pertanyaan..."
                      className="w-full placeholder:text-gray-500 text-gray-900 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#eab308] outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-8">
              {/* TOMBOL KEMBALI DIPERBAIKI MENJADI setView(0) AGAR KEMBALI KE LIST */}
              <button
                type="button"
                onClick={() => setView(0)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                &larr; Batal & Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmitTugas}
                disabled={loading}
                className="bg-[#1B3167] text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1a2b44] transition-colors shadow-sm flex items-center gap-2"
              >
                {loading
                  ? "Menyimpan..."
                  : editingTaskId
                    ? "Simpan Perubahan"
                    : "Simpan & Sebarkan Tugas"}
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: HASIL TUGAS CEKLIS */}
        {view === 2 && selectedTaskResult && isAdmin && (
          <div className="space-y-6">
            <div className="bg-[#1B3167] border-2 border-black/10 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                  <FaClipboardCheck className="text-2xl text-[#EAB308]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-black/10 text-white px-2.5 py-1 rounded-md">
                    Hasil Tugas Ceklis
                  </span>
                  <h1 className="text-3xl font-bold mt-2">
                    {selectedTaskResult.title}
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setView(0)}
                className="bg-black/30 border border-[#1B3167] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/90 flex items-center gap-2 transition-colors shadow-sm"
              >
                <FaArrowLeft /> Kembali
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#1B3167] border-2 border-black/10 text-white p-6 rounded-2xl  shadow-sm relative overflow-hidden flex flex-col justify-between h-56">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold tracking-wider uppercase opacity-100">
                    Total Keseluruhan
                  </span>
                  <div className="w-8 h-8 bg-black/10 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-white">
                    {totalSelesai} / {totalAssigned}
                  </h2>
                  <div className="w-full bg-black/10 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-white h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${totalAssigned > 0 ? (totalSelesai / totalAssigned) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm mt-1.5 block opacity-80">
                    {totalAssigned > 0
                      ? Math.round((totalSelesai / totalAssigned) * 100)
                      : 0}
                    % selesai
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-56">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                    Tour Leader
                  </span>
                  <div className="w-8 h-8 bg-[#1B3167]/10 text-[#111c2e] rounded-xl flex items-center justify-center">
                    <FaUserTie className="text-[#1B3167]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900">
                    {tlSelesai} / {assignedTourLeaders.length}
                  </h2>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-[#111c2e] h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${assignedTourLeaders.length > 0 ? (tlSelesai / assignedTourLeaders.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm mt-1.5 block text-slate-400">
                    {assignedTourLeaders.length > 0
                      ? Math.round(
                          (tlSelesai / assignedTourLeaders.length) * 100,
                        )
                      : 0}
                    % selesai
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between h-56">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                    Muthawif
                  </span>
                  <div className="w-8 h-8 bg-[#1B3167]/10 text-[#111c2e] rounded-xl flex items-center justify-center">
                    <FaUserGraduate className="text-[#1B3167]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-slate-900">
                    {muthawifSelesai} / {assignedMuthawif.length}
                  </h2>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                    <div
                      className="bg-[#111c2e] h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${assignedMuthawif.length > 0 ? (muthawifSelesai / assignedMuthawif.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm mt-1.5 block text-slate-400">
                    {assignedMuthawif.length > 0
                      ? Math.round(
                          (muthawifSelesai / assignedMuthawif.length) * 100,
                        )
                      : 0}
                    % selesai
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-[#1B3167] text-white px-6 py-4  flex justify-between items-center border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FaUserTie className="text-[#eab308]" /> Tour Leader
                </div>
                <div className="flex gap-2">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaCheckCircle className="text-[#eab308]" /> {tlSelesai}{" "}
                    Selesai
                  </span>
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaClock className="text-slate-400" />{" "}
                    {assignedTourLeaders.length - tlSelesai} Belum
                  </span>
                </div>
              </div>

              <div className="p-6">
                {assignedTourLeaders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <FaInbox className="text-3xl text-slate-300 mb-2" />
                    <p className="text-xs font-medium">
                      tidak ada Tour Leader yang menerima tugas ini
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                          <th className="py-3 px-4 w-12">#</th>
                          <th className="py-3 px-4">Nama</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignedTourLeaders.map((tl, idx) => (
                          <tr key={tl.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-[#111c2e] flex items-center justify-center">
                                <FaUserTie className="text-[10px] text-[#eab308]" />
                              </span>
                              {tl.username || "Tanpa Nama"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {tl.status === "completed" ||
                              tl.status === "submitted" ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 text-[10px]">
                                  <FaCheckCircle className="text-[#eab308]" />{" "}
                                  Selesai
                                </span>
                              ) : (
                                <span className="bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 text-[10px]">
                                  <FaClock /> Belum dikerjakan
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-[#1B3167] text-white px-6 py-4 flex justify-between items-center border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FaUserGraduate className="text-[#eab308]" /> Muthawif
                </div>
                <div className="flex gap-2">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaCheckCircle className="text-[#eab308]" />{" "}
                    {muthawifSelesai} Selesai
                  </span>
                  <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaClock className="text-slate-400" />{" "}
                    {assignedMuthawif.length - muthawifSelesai} Belum
                  </span>
                </div>
              </div>

              <div className="p-6">
                {assignedMuthawif.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <FaInbox className="text-3xl text-slate-300 mb-2" />
                    <p className="text-xs font-medium">
                      tidak ada Muthawif yang menerima tugas ini
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                          <th className="py-3 px-4 w-12">#</th>
                          <th className="py-3 px-4">Nama</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignedMuthawif.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-[#111c2e] flex items-center justify-center">
                                <FaUserGraduate className="text-[10px] text-[#eab308]" />
                              </span>
                              {m.username || "Tanpa Nama"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {m.status === "completed" ||
                              m.status === "submitted" ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200/50 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 text-[10px]">
                                  <FaCheckCircle className="text-[#eab308]" />{" "}
                                  Selesai
                                </span>
                              ) : (
                                <span className="bg-slate-50 text-slate-600 border border-slate-100 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1 text-[10px]">
                                  <FaClock /> Belum dikerjakan
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL POP-UP DETAIL SOAL */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden">
            <div className="bg-[#1B3167] text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="bg-[#eab308] text-[#111c2e] w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm">
                  ✓
                </span>
                <h3 className="font-bold text-white text-base tracking-wide">
                  Detail Tugas Ceklis
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="text-slate-400 hover:text-white font-bold text-lg transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Judul Tugas
                </p>
                <p className="text-[#111c2e] font-bold text-base mt-0.5">
                  {selectedTaskDetail.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Waktu Buka
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-0.5">
                    {new Date(selectedTaskDetail.opens_at).toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Waktu Tutup
                  </p>
                  <p className="text-xs font-bold text-rose-500 mt-0.5">
                    {new Date(selectedTaskDetail.closes_at).toLocaleString(
                      "id-ID",
                    )}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                  Daftar Pertanyaan (
                  {selectedTaskDetail.checklist_questions?.length || 0} Soal)
                </p>
                <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 max-h-48 overflow-y-auto">
                  {selectedTaskDetail.checklist_questions &&
                  selectedTaskDetail.checklist_questions.length > 0 ? (
                    selectedTaskDetail.checklist_questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="flex gap-2.5 text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <span className="font-bold text-[#eab308]">
                          {idx + 1}.
                        </span>
                        <span>
                          {q.question_text || q.text || "(Pertanyaan kosong)"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      Tidak ada soal dalam tugas ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                {!isAdmin && (
                  <button
                    onClick={handleMarkDone}
                    disabled={isTaskCompleted || markingDone}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 ${
                      isTaskCompleted
                        ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                        : "bg-[#eab308] text-[#111c2e] hover:bg-amber-400"
                    }`}
                  >
                    {markingDone ? (
                      "Menyimpan..."
                    ) : isTaskCompleted ? (
                      <>
                        <FaCheckCircle /> Selesai Dikerjakan
                      </>
                    ) : (
                      "Tandai Selesai"
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedTaskDetail(null)}
                  className="px-5 py-2.5 bg-[#1B3167] text-white rounded-xl text-xs font-bold hover:bg-[#1a2b44] transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
