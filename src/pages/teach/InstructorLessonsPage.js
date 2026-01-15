import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
// Icons
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Avatar,
  useTheme,
  alpha
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;
const API_URL = "http://localhost:8080/api";

export default function InstructorLessonsPage() {
  const theme = useTheme(); // Lấy theme để dùng màu chuẩn
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [keyword, setKeyword] = useState("");
  const [grade, setGrade] = useState("");
  const [month, setMonth] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  // --- HÀM GỌI API ---
  const loadLessons = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      let token = "";
      if (userStr) {
        const userObj = JSON.parse(userStr);
        token = userObj.accessToken;
      }

      if (!token) {
        console.error("Không tìm thấy token đăng nhập!");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/teacher/lessons`, {
        params: {
          keyword: keyword || null,
          grade: grade || null,
          month: month || null,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLessons(response.data || []);
    } catch (error) {
      console.error("Lỗi tải bài giảng:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadLessons();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [keyword, grade, month]);

  const availableGrades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const availableMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const totalPages = Math.ceil(lessons.length / PAGE_SIZE);
  const pagedLessons = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return lessons.slice(start, start + PAGE_SIZE);
  }, [lessons, page]);

  const handleReload = () => {
    setKeyword("");
    setGrade("");
    setMonth("");
    setPage(1);
    loadLessons();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: 4, px: { xs: 2, md: 6 } }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#1a237e", mb: 1 }}>
            Quản lý bài giảng
            </Typography>
            <Typography variant="body1" color="text.secondary">
            Danh sách các bài giảng hiện có trong hệ thống
            </Typography>
        </Box>
        {/* Nút thêm mới có thể đặt ở đây nếu cần */}
      </Box>

      {/* FILTER BAR CARD */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack 
            direction={{ xs: "column", md: "row" }} 
            spacing={2} 
            alignItems="center"
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm bài giảng..."
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
                "& .MuiOutlinedInput-root": { borderRadius: 2 } 
              }}
            />

            <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" }, flex: 1 }}>
                <FormControl fullWidth size="medium">
                <InputLabel>Khối lớp</InputLabel>
                <Select 
                    value={grade} 
                    label="Khối lớp" 
                    onChange={(e) => setGrade(e.target.value)}
                    sx={{ borderRadius: 2 }}
                >
                    <MenuItem value=""><em>Tất cả</em></MenuItem>
                    {availableGrades.map((g) => (
                    <MenuItem key={g} value={g}>Khối {g}</MenuItem>
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
                    <MenuItem value=""><em>Tất cả</em></MenuItem>
                    {availableMonths.map((m) => (
                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                    ))}
                </Select>
                </FormControl>
            </Stack>

            <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />} 
                onClick={handleReload}
                sx={{ 
                    height: 56, 
                    px: 3, 
                    borderRadius: 2,
                    borderColor: theme.palette.divider,
                    color: "text.primary",
                    "&:hover": { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}
            >
              Làm mới
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* TABLE SECTION */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)", overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ py: 2, pl: 4, fontWeight: "bold", color: "#1a237e" }}>Thông tin bài giảng</TableCell>
              <TableCell sx={{ py: 2, fontWeight: "bold", color: "#1a237e" }}>Mã bài</TableCell>
              <TableCell align="center" sx={{ py: 2, fontWeight: "bold", color: "#1a237e" }}>Khối</TableCell>
              <TableCell align="center" sx={{ py: 2, fontWeight: "bold", color: "#1a237e" }}>Tháng dạy</TableCell>
              <TableCell align="right" sx={{ py: 2, pr: 4, fontWeight: "bold", color: "#1a237e" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
            ) : pagedLessons.length > 0 ? (
              pagedLessons.map((lesson) => (
                <TableRow
                  key={lesson.id}
                  hover
                  onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}
                  sx={{ 
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) } 
                  }}
                >
                  {/* Cột 1: Ảnh + Tên */}
                  <TableCell sx={{ pl: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            component="img"
                            src={lesson.coverImage || "/assets/images/no-image.png"}
                            alt={lesson.name}
                            sx={{
                                width: 70,
                                height: 50,
                                objectFit: "cover",
                                borderRadius: 2,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                            }}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image" }}
                        />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                {lesson.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ID: {lesson.id}
                            </Typography>
                        </Box>
                    </Stack>
                  </TableCell>

                  {/* Cột 2: Mã Code */}
                  <TableCell>
                    <Chip 
                        label={lesson.code} 
                        size="small" 
                        sx={{ 
                            fontWeight: 600, 
                            bgcolor: alpha(theme.palette.info.main, 0.1), 
                            color: theme.palette.info.dark 
                        }} 
                    />
                  </TableCell>

                  {/* Cột 3: Khối */}
                  <TableCell align="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: theme.palette.secondary.main, mx: "auto" }}>
                        {lesson.grade}
                    </Avatar>
                  </TableCell>

                  {/* Cột 4: Tháng */}
                  <TableCell align="center">
                    <Typography fontWeight={500} color="text.secondary">T{lesson.teachingMonth}</Typography>
                  </TableCell>

                  {/* Cột 5: Nút hành động giả lập */}
                  <TableCell align="right" sx={{ pr: 4 }}>
                    <Button size="small" variant="text">Chi tiết</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Stack alignItems="center" spacing={1}>
                        <FilterListIcon sx={{ fontSize: 40, color: "text.disabled" }} />
                        <Typography color="text.secondary">Không tìm thấy dữ liệu phù hợp</Typography>
                    </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
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