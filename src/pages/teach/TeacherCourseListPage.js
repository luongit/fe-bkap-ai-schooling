import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";

import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";

const PAGE_SIZE = 8;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

function getToken() {
  const userStr = localStorage.getItem("user");

  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      return userObj.accessToken || userObj.token || "";
    } catch {
      return "";
    }
  }

  const tokenStr = localStorage.getItem("token");

  if (tokenStr) {
    try {
      const tokenObj = JSON.parse(tokenStr);
      return tokenObj.accessToken || tokenObj.token || tokenStr;
    } catch {
      return tokenStr;
    }
  }

  return localStorage.getItem("access_token") || "";
}

function getServerUrl() {
  return API_URL.replace(/\/api\/?$/, "");
}

function getFileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${getServerUrl()}${path}`;
}

export default function TeacherCourseListPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);

  const availableGrades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const availableMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));

  const pagedCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return courses.slice(start, start + PAGE_SIZE);
  }, [courses, page]);

  const loadCourses = async () => {
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        console.error("Không tìm thấy token đăng nhập!");
        setCourses([]);
        return;
      }

      const response = await axios.get(`${API_URL}/teacher/courses`, {
        params: {
          keyword: keyword || null,
          grade: grade || null,
          month: month || null,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data || []);
    } catch (error) {
      console.error("Lỗi tải khóa học:", error);

      if (
        error.response &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }

      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadCourses();
    }, 500);

    return () => clearTimeout(timer);

    // eslint-disable-next-line
  }, [keyword, grade, month]);

  const handleReload = () => {
    setKeyword("");
    setGrade("");
    setMonth("");
    setPage(1);
    loadCourses();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        py: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              color: "#1f2937",
              mb: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Khóa học của tôi
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Danh sách khóa học được mở theo khối lớp giáo viên phụ trách
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleReload}
          sx={{
            height: 42,
            px: 2.5,
            borderRadius: 2,
            bgcolor: "white",
            borderColor: "#d1d5db",
            color: "#111827",
            textTransform: "none",
            fontWeight: 700,
            flexShrink: 0,
            "&:hover": {
              borderColor: "#111827",
              bgcolor: "#f9fafb",
            },
          }}
        >
          Làm mới
        </Button>
      </Box>

      {/* Filter */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "none",
          border: "1px solid #e5e7eb",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm khóa học..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#fff",
                },
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{
                width: { xs: "100%", md: "auto" },
                flex: 1,
              }}
            >
              <FormControl fullWidth size="medium">
                <InputLabel>Khối lớp</InputLabel>
                <Select
                  value={grade}
                  label="Khối lớp"
                  onChange={(e) => setGrade(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>

                  {availableGrades.map((g) => (
                    <MenuItem key={g} value={g}>
                      Khối {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel>Tháng</InputLabel>
                <Select
                  value={month}
                  label="Tháng"
                  onChange={(e) => setMonth(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>

                  {availableMonths.map((m) => (
                    <MenuItem key={m} value={m}>
                      Tháng {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Paper
          sx={{
            borderRadius: 3,
            py: 10,
            textAlign: "center",
            boxShadow: "none",
            border: "1px solid #e5e7eb",
          }}
        >
          <CircularProgress />

          <Typography sx={{ mt: 2 }} color="text.secondary">
            Đang tải khóa học...
          </Typography>
        </Paper>
      ) : pagedCourses.length > 0 ? (
        <>
          {/* Course list - Udemy style */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 3,
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {pagedCourses.map((course) => {
              const description =
                course.description || "Chưa có mô tả khóa học.";

              return (
                <Card
                  key={course.id}
                  onClick={() => navigate(`/teacher/courses/${course.id}`)}
                  sx={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    height: 350,
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "white",
                    border: "1px solid #e5e7eb",
                    boxShadow: "none",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                      borderColor: "#c7d2fe",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {/* Thumbnail */}
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      flexShrink: 0,
                      overflow: "hidden",
                      bgcolor: "#f3f4f6",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {course.coverImage ? (
                      <Box
                        component="img"
                        src={getFileUrl(course.coverImage)}
                        alt={course.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "center",
                          backgroundColor: "#f3f4f6",
                          display: "block",
                          transition: "transform 0.25s ease",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(124,58,237,0.10))",
                        }}
                      >
                        <SchoolIcon
                          sx={{
                            fontSize: 54,
                            color: alpha(theme.palette.primary.main, 0.5),
                          }}
                        />
                      </Stack>
                    )}
                  </Box>

                  {/* Content */}
                  <CardContent
                    sx={{
                      p: 2.2,
                      flex: 1,
                      minWidth: 0,
                      maxWidth: "100%",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {/* Title */}
                    <Typography
                      title={course.name}
                      sx={{
                        color: "#111827",
                        fontSize: 19,
                        fontWeight: 900,
                        lineHeight: "23px",
                        height: 46,
                        mb: 0.8,

                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",

                        minWidth: 0,
                        maxWidth: "100%",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {course.name}
                    </Typography>

                    {/* Description */}
                    <Typography
                      title={description}
                      sx={{
                        color: "#6b7280",
                        fontSize: 14,
                        lineHeight: "20px",
                        height: 60,
                        mb: 1.4,

                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",

                        minWidth: 0,
                        maxWidth: "100%",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {description}
                    </Typography>

                    <Box sx={{ flex: 1 }} />

                    {/* Badges */}
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{
                        minHeight: 28,
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                    >
                      <Chip
                        label={`Khối ${course.grade}`}
                        size="small"
                        sx={{
                          height: 26,
                          borderRadius: 1,
                          bgcolor: "#ccfbf1",
                          color: "#0f766e",
                          fontWeight: 900,
                          fontSize: 13,
                        }}
                      />

                      <Chip
                        label={`Tháng ${course.teachingMonth}`}
                        size="small"
                        sx={{
                          height: 26,
                          borderRadius: 1,
                          bgcolor: "#ede9fe",
                          color: "#6d28d9",
                          fontWeight: 900,
                          fontSize: 13,
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Paper
              sx={{
                mt: 4,
                px: 3,
                py: 2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                boxShadow: "none",
                border: "1px solid #e5e7eb",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Trang{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {page}
                </Box>{" "}
                / {totalPages} • Tổng {courses.length} khóa học
              </Typography>

              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                size="medium"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Paper>
          )}
        </>
      ) : (
        <Paper
          sx={{
            borderRadius: 3,
            py: 8,
            textAlign: "center",
            boxShadow: "none",
            border: "1px solid #e5e7eb",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <FilterListIcon
              sx={{
                fontSize: 44,
                color: "text.disabled",
              }}
            />

            <Typography color="text.secondary">
              Không tìm thấy khóa học phù hợp
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}