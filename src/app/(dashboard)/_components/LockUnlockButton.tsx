import { Button } from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import axios from "axios";

interface Package {
  id: number;
  testName: string;
  title: string;
  questions: Question[];
  isLocked: boolean; // Menambahkan properti isLocked
}

interface Question {
  id: number;
  content: string;
  type: string;
  packageId: number;
  image: string | null;
  explanation: string;
}

interface Props {
  packageId: number;
  isLocked: boolean;
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
}

const LockUnlockButton: React.FC<Props> = ({
  packageId,
  isLocked,
}) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const handleLockUnlock = async () => {
    try {
      // Mengatur URL API
      const url = `/api/paket/lock/${packageId}`;

      // Mengirim request menggunakan Axios
      const response = await axios.put(url, { isLocked: !isLocked });

      if (response.status === 200) {
        enqueueSnackbar(
          `Paket ${isLocked ? "dibuka kunci" : "terkunci"} berhasil`,
          { variant: "success" }
        );
        // Redirect ke halaman yang sama setelah berhasil
        router.refresh();
      } else {
        throw new Error("Failed to lock/unlock package");
      }
    } catch (error) {
      enqueueSnackbar("Gagal memperbarui status paket", { variant: "error" });
    }
  };

  return (
    <Button variant="outlined" onClick={handleLockUnlock}>
      {isLocked ? "Buka Kunci" : "Kunci"}
    </Button>
  );
};

export default LockUnlockButton;
