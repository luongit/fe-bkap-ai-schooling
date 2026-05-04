import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";

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
  Grid,
  useTheme,
  alpha,
} from "@mui/material";

const PAGE_SIZE = 6;
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

function parseCourseVideos(videoUrl) {
  if (!videoUrl) return [];

  try {
    const parsed = JSON.parse(videoUrl);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.url);
  } catch {
    return [];
  }
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

  const totalPages = Math.ceil(courses.length / PAGE_SIZE);

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
        bgcolor: "#f4f6f8",
        py: 4,
        px: { xs: 2, md: 6 },
      }}
    >
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: "#1a237e", mb: 1 }}
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
            height: 44,
            px: 3,
            borderRadius: 2,
            bgcolor: "white",
            borderColor: theme.palette.divider,
            color: "text.primary",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          Làm mới
        </Button>
      </Box>

      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
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
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ width: { xs: "100%", md: "auto" }, flex: 1 }}
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

      {loading ? (
        <Paper
          sx={{
            borderRadius: 3,
            py: 10,
            textAlign: "center",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Đang tải khóa học...
          </Typography>
        </Paper>
      ) : pagedCourses.length > 0 ? (
        <Grid container spacing={3}>
          {pagedCourses.map((course) => {
            const videos = parseCourseVideos(course.videoUrl);

            return (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
  <Card
    onClick={() => navigate(`/teacher/courses/${course.id}`)}
    sx={{
      height: "100%",
      borderRadius: 4,
      overflow: "hidden",
      cursor: "pointer",
      boxShadow: "0px 6px 24px rgba(0,0,0,0.07)",
      transition: "all 0.25s ease",
      border: "1px solid",
      borderColor: "rgba(0,0,0,0.06)",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0px 12px 30px rgba(0,0,0,0.14)",
      },
    }}
  >
    {/* Cover */}
    <Box
      sx={{
        position: "relative",
        height: 190,
        overflow: "hidden",
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      }}
    >
      {course.coverImage ? (
        <>
          {/* nền cover */}
          <Box
            component="img"
            src={getFileUrl(course.coverImage)}
            alt={course.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "brightness(0.92)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* overlay nhẹ cho đẹp */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.32), rgba(0,0,0,0.06))",
            }}
          />
        </>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(156,39,176,0.08))",
          }}
        >
          <SchoolIcon
            sx={{
              fontSize: 62,
              color: alpha(theme.palette.primary.main, 0.45),
            }}
          />
        </Stack>
      )}

      {/* badge */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          right: 12,
          justifyContent: "space-between",
        }}
      >
        <Chip
          label={`Khối ${course.grade}`}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.92)",
            fontWeight: 700,
            color: theme.palette.primary.dark,
            backdropFilter: "blur(4px)",
          }}
        />

        <Chip
          label={`Tháng ${course.teachingMonth}`}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.92)",
            fontWeight: 700,
            color: theme.palette.secondary.dark,
            backdropFilter: "blur(4px)",
          }}
        />
      </Stack>
    </Box>

    {/* Nội dung */}
    <CardContent sx={{ p: 2.5 }}>
      <Typography
        variant="h6"
        fontWeight={800}
        sx={{
          color: "#1a237e",
          mb: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 56,
          lineHeight: 1.35,
        }}
      >
        {course.name}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: 42,
          lineHeight: 1.6,
        }}
      >
        {course.description || "Chưa có mô tả khóa học."}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        <Chip
          icon={<MenuBookIcon />}
          label="Xem bài học"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />

        {videos.length > 0 && (
          <Chip
            icon={<PlayCircleIcon />}
            label={`${videos.length} video`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: theme.palette.error.dark,
              fontWeight: 600,
            }}
          />
        )}
      </Stack>
    </CardContent>
  </Card>
</Grid>
            );
          })}
        </Grid>
      ) : (
        <Paper
          sx={{
            borderRadius: 3,
            py: 8,
            textAlign: "center",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <FilterListIcon sx={{ fontSize: 44, color: "text.disabled" }} />
            <Typography color="text.secondary">
              Không tìm thấy khóa học phù hợp
            </Typography>
          </Stack>
        </Paper>
      )}

      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            size="large"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}
    </Box>
  );
}