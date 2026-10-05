import Image from "next/image";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardScreen from "./screens/DashboardScreen";

export default function Home() {
  return (
    <DashboardLayout>
      {/* The Screen passes the card UI into the Layout's 'children' */}
      <DashboardScreen />
    </DashboardLayout>
  );
}
