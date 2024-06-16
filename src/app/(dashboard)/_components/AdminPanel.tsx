import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  AppBar,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Button,
  CircularProgress,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Question {
  id: number;
  content: string;
}

interface Package {
  id: number;
  title: string;
  description: string;
  type: string;
  isHidden: boolean;
  isLocked: boolean;
  questions: Question[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserResult {
  id: number;
  score: number;
  User: User;
  Package: Package;
}

interface AdminPanelProps {
  userResults: UserResult[];
  setUserResults: (results: UserResult[]) => void;
  type: string;
  setType: (value: string) => void;
  selectedPackage: string;
  setSelectedPackage: (value: string) => void;
  date: string;
  setDate: (date: string) => void;
  packages: Package[];
  setPackages: (packages: Package[]) => void;
}

const useStyles = makeStyles({
  appBar: {
    alignItems: "center",
  },
  tabs: {
    justifyContent: "center",
  },
  tab: {
    color: "#fff",
    "&.Mui-selected": {
      color: "#fff",
      backgroundColor: "#1976d2",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "4px",
    },
  },
  statCard: {
    margin: "8px",
  },
});

const AdminPanel: React.FC<AdminPanelProps> = ({
  userResults,
  setUserResults,
  type,
  setType,
  selectedPackage,
  setSelectedPackage,
  date,
  setDate,
  packages,
  setPackages,
}) => {
  const classes = useStyles();
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [medianScore, setMedianScore] = useState<number | null>(null);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [questionMissCount, setQuestionMissCount] = useState<{ [key: number]: number }>({});

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchPackages = async () => {
      if (type) {
        const response = await fetch(`/api/paket/${type}/profile`);
        if (response.ok) {
          const data = await response.json();
          setPackages(
            data.packages.filter(
              (pkg: Package) => !pkg.isHidden && !pkg.isLocked
            )
          );
        } else {
          console.error("Failed to fetch packages");
        }
      }
    };
    fetchPackages();
  }, [type, setPackages]);

  useEffect(() => {
    const fetchUserResults = async () => {
      if (type && selectedPackage && date) {
        setLoading(true);
        const response = await fetch(
          `/api/paket/${type}/attemp?packageId=${selectedPackage}&date=${date}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserResults(data.results);
          setQuestionMissCount(data.questionMissCount);
          setLoading(false);

          if (data.results.length > 0) {
            const scores = data.results.map(
              (result: UserResult) => result.score
            );
            setAverageScore(
              scores.reduce((a: number, b: number) => a + b, 0) / scores.length
            );
            setMedianScore(
              scores.sort((a: number, b: number) => a - b)[
                Math.floor(scores.length / 2)
              ]
            );
            setMinScore(Math.min(...scores));
            setMaxScore(Math.max(...scores));
          } else {
            setAverageScore(null);
            setMedianScore(null);
            setMinScore(null);
            setMaxScore(null);
          }
        } else {
          console.error("Failed to fetch user results");
          setLoading(false);
        }
      }
    };
    fetchUserResults();
  }, [type, selectedPackage, date, setUserResults]);

  const renderStats = () => (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <Card className={`${classes.statCard} shadow-lg`}>
          <CardContent>
            <Typography variant="h6">Rata-rata</Typography>
            <Typography variant="body2">
              {averageScore !== null ? averageScore.toFixed(2) : "N/A"} / 100
              poin
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={`${classes.statCard} shadow-lg`}>
          <CardContent>
            <Typography variant="h6">Median</Typography>
            <Typography variant="body2">
              {medianScore !== null ? medianScore.toFixed(2) : "N/A"} / 100 poin
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={`${classes.statCard} shadow-lg`}>
          <CardContent>
            <Typography variant="h6">Rentang</Typography>
            <Typography variant="body2">
              {minScore !== null && maxScore !== null
                ? `${minScore} - ${maxScore}`
                : "N/A"}{" "}
              poin
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={3}>
        <Card className={`${classes.statCard} shadow-lg`}>
          <CardContent>
            <Typography variant="h6">Jumlah Peserta</Typography>
            <Typography variant="body2">
              {userResults.length} peserta
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCharts = () => {
    const sortedMissedQuestions = Object.entries(questionMissCount).sort(
      (a, b) => b[1] - a[1]
    );

    const scoreDistribution: { [key: string]: number } = {};
    userResults.forEach((result) => {
      const scoreRange: string = `${Math.floor(result.score / 10) * 10} - ${Math.floor(result.score / 10) * 10 + 9}`;
      scoreDistribution[scoreRange] =
        (scoreDistribution[scoreRange] || 0) + 1;
    });

    const questionLabels = sortedMissedQuestions.slice(0, 5).map((item) => {
      const questionId = parseInt(item[0]);
      const questionResult = userResults.find(result => 
        result.Package && result.Package.questions && result.Package.questions.some(q => q.id === questionId)
      );
      if (questionResult) {
        const question = questionResult.Package.questions.find(q => q.id === questionId);
        if (question) {
          return question.content || `Soal Gambar ${question.id}`;
        }
      }
      return `Soal ${item[0]}`;
    });

    return (
      <Grid container spacing={2} className="mt-4">
        <Grid item xs={12} md={6}>
          <Card className="shadow-lg">
            <CardContent>
              <Typography variant="h6">Distribusi Skor</Typography>
              <Bar
                data={{
                  labels: Object.keys(scoreDistribution),
                  datasets: [
                    {
                      label: "Jumlah Responden",
                      data: Object.values(scoreDistribution),
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="shadow-lg">
            <CardContent>
              <Typography variant="h6">
                Pertanyaan yang Sering Terlewatkan
              </Typography>
              <Bar
                data={{
                  labels: questionLabels,
                  datasets: [
                    {
                      label: "Jumlah Terlewatkan",
                      data: sortedMissedQuestions
                        .slice(0, 5)
                        .map((item) => item[1]),
                      backgroundColor: "rgba(255, 99, 132, 0.2)",
                      borderColor: "rgba(255, 99, 132, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2} className="mt-4">
      <Grid item xs={12}>
        <Card className="shadow-lg">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Admin Panel
            </Typography>
            <FormControl fullWidth className="mb-4">
              <InputLabel>Type</InputLabel>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <MenuItem value="SKD">SKD</MenuItem>
                <MenuItem value="TPA">TPA</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth className="mb-4" disabled={!type}>
              <InputLabel>Pilih Paket</InputLabel>
              <Select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
              >
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Pilih Tanggal"
              type="date"
              fullWidth
              className="mb-4"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <AppBar position="static" className={classes.appBar}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="simple tabs example"
                centered
                className={classes.tabs}
              >
                <Tab label="Statistik" className={classes.tab} />
                <Tab label="Hasil" className={classes.tab} />
              </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
              {selectedPackage && date ? (
                <>
                  <Typography variant="h6" className="font-bold mb-2">
                    Statistik
                  </Typography>
                  {renderStats()}
                  {renderCharts()}
                </>
              ) : (
                <Typography variant="body2">
                  Silakan pilih paket dan tanggal untuk melihat statistik.
                </Typography>
              )}
            </TabPanel>
            <TabPanel value={value} index={1}>
              {selectedPackage && date ? (
                <>
                  <Typography variant="h6" className="font-bold mb-2">
                    Hasil
                  </Typography>
                  {loading ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nomor</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>Skor</TableCell>
                            <TableCell>Lihat Hasil</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userResults.map((result, i) => (
                            <TableRow key={result.id}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{result.User.username}</TableCell>
                              <TableCell>{result.score}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  color="info"
                                  onClick={() =>
                                    router.push(`/hasil/${result.id}`)
                                  }
                                >
                                  Lihat Hasil
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              ) : (
                <Typography variant="body2">
                  Silakan pilih paket dan tanggal untuk melihat hasil.
                </Typography>
              )}
            </TabPanel>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

export default AdminPanel;
