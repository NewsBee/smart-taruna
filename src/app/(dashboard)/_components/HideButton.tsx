import { Button } from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useQueryClient } from "react-query";

// Asumsi bahwa Anda memiliki definisi Package dan Question di tempat lain

interface Props {
  packageId: number;
  isHidden: boolean; // Menambahkan properti isHidden
  testName?: string;
}

const HideUnhideButton: React.FC<Props> = ({
  packageId,
  isHidden,
  testName,
}) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleHideUnhide = async () => {
    try {
      // Sesuaikan URL API untuk mengubah status "hidden"
      const url = `/api/paket/hide/${packageId}`;

      // Mengirim request menggunakan Axios untuk mengubah status "hidden"
      const response = await axios.put(url, { isHidden: !isHidden });

      if (response.status === 200) {
        enqueueSnackbar(
          `Paket ${isHidden ? "ditampilkan" : "disembunyikan"} berhasil`,
          { variant: "success" }
        );
        // Invalidate queries untuk memperbarui data pada UI
        queryClient.invalidateQueries(["Packages", testName]);
      } else {
        throw new Error("Failed to change package visibility");
      }
    } catch (error) {
      enqueueSnackbar("Gagal memperbarui visibilitas paket", { variant: "error" });
    }
  };

  return (
    <Button variant="outlined" onClick={handleHideUnhide}>
      {isHidden ? "Tampilkan" : "Sembunyikan"}
    </Button>
  );
};

export default HideUnhideButton;
