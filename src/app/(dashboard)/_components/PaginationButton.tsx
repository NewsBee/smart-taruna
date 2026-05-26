import { Button } from "@material-ui/core";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

interface IPaginationButton {
  onClick: () => void;
  disabled: boolean;
  title: "Previous Question" | "Next Question";
}

export const PaginationButton: React.FC<IPaginationButton> = ({
  onClick,
  disabled,
  title,
}) => (
  <Button
    onClick={onClick}
    variant="outlined"
    color="primary"
    disabled={disabled}
    style={{
      borderRadius: 12,
      borderColor: disabled ? "#cbd5e1" : "#0f766e",
      color: disabled ? "#94a3b8" : "#0f766e",
      padding: "10px 14px",
      textTransform: "none",
      fontWeight: 700,
      backgroundColor: disabled ? "#f8fafc" : "#ffffff",
    }}
  >
    {title === "Next Question" ? (
      <>
        <p className="mr-2 hidden md:block">Soal berikutnya</p>
        <MdNavigateNext
          fill={disabled ? "#94a3b8" : "#0f766e"}
          size={30}
        />
      </>
    ) : (
      <>
        <MdNavigateBefore
          fill={disabled ? "#94a3b8" : "#0f766e"}
          size={30}
        />
        <p className="ml-2 hidden md:block">Soal sebelumnya</p>
      </>
    )}
  </Button>
);
