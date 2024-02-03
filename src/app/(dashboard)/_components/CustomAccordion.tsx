import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  tipeSoal: string;
  responses: any[];
}

const CustomAccordion: React.FC<Props> = ({ tipeSoal, responses }) => {
  const filteredResponses = responses.filter((resp) => resp.quiz === tipeSoal);
  // console.log(filteredResponses)

  // Hitung statistik berdasarkan data respons yang sudah difilter
  const totalQuestions = filteredResponses.length;
  const answeredQuestions = filteredResponses.filter(
    (resp) => resp.response !== ""
  ).length;
  const correctAnswers = filteredResponses.filter(
    (resp) => resp.response === resp.correct
  ).length;
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const totalScore = filteredResponses.reduce(
    (acc, resp) => acc + resp.score,
    0
  );

  return (
    <div className="my-3">
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="subtitle1">
            Statistik Soal {tipeSoal}{" "}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Informasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Jawaban dijawab
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {answeredQuestions}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Kosong
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalQuestions - answeredQuestions}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Jumlah Benar
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {correctAnswers}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Jumlah Salah
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incorrectAnswers}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total Nilai
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalScore}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Passing Grade
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    80 {/* Gantilah ini dengan perhitungan yang sesuai */}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default CustomAccordion;
