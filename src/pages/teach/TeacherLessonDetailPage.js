import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  List,
  ListItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import HtmlIcon from "@mui/icons-material/Html";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArticleIcon from "@mui/icons-material/Article";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TableChartIcon from "@mui/icons-material/TableChart";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const GRADE_OPTIONS = [
  { value: 0, label: "Mầm non" },
  { value: 101, label: "Tiểu học" },
  { value: 102, label: "THCS" },
  { value: 103, label: "THPT" },
  { value: 1, label: "Khối 1" },
  { value: 2, label: "Khối 2" },
  { value: 3, label: "Khối 3" },
  { value: 4, label: "Khối 4" },
  { value: 5, label: "Khối 5" },
  { value: 6, label: "Khối 6" },
  { value: 7, label: "Khối 7" },
  { value: 8, label: "Khối 8" },
  { value: 9, label: "Khối 9" },
  { value: 10, label: "Khối 10" },
  { value: 11, label: "Khối 11" },
  { value: 12, label: "Khối 12" },
];

function getGradeLabel(grade) {
  const numberGrade = Number(grade);
  const found = GRADE_OPTIONS.find((item) => item.value === numberGrade);

  if (found) return found.label;

  return grade === null || grade === undefined || grade === ""
    ? "Chưa phân loại"
    : `Khối ${grade}`;
}

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

function getOfficeViewerUrl(fileUrl) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    fileUrl
  )}`;
}

function isWordFile(fileType, fileName) {
  return (
    fileType === "DOC" ||
    fileType === "DOCX" ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  );
}

function isPowerPointFile(fileType, fileName) {
  return (
    fileType === "PPT" ||
    fileType === "PPTX" ||
    fileName.endsWith(".ppt") ||
    fileName.endsWith(".pptx")
  );
}

function isExcelFile(fileType, fileName) {
  return (
    fileType === "XLS" ||
    fileType === "XLSX" ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  );
}

function getPreviewUrl(file) {
  if (!file) return "";

  const fileType = String(file.fileType || "").toUpperCase();
  const fileName = String(file.fileName || "").toLowerCase();

  if (fileType === "PDF" || fileName.endsWith(".pdf")) {
    return getFileUrl(file.filePath);
  }

  if (
    fileType === "HTML" ||
    fileName.endsWith(".html") ||
    fileName.endsWith(".htm")
  ) {
    return getFileUrl(file.filePath);
  }

  if (
    isWordFile(fileType, fileName) ||
    isPowerPointFile(fileType, fileName) ||
    isExcelFile(fileType, fileName)
  ) {
    const fileUrl = getFileUrl(file.filePath);
    return getOfficeViewerUrl(fileUrl);
  }

  if (fileType === "ZIP" || fileType === "RAR") {
    const basePath = file.folderPath || file.filePath;

    if (!basePath) return "";

    const cleanPath = String(basePath).replace(/\\/g, "/").replace(/\/$/, "");

    if (cleanPath.toLowerCase().endsWith("/index.html")) {
      return getFileUrl(cleanPath);
    }

    if (
      cleanPath.toLowerCase().endsWith(".zip") ||
      cleanPath.toLowerCase().endsWith(".rar")
    ) {
      return "";
    }

    return getFileUrl(`${cleanPath}/index.html`);
  }

  return "";
}

export default function TeacherLessonDetailPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const previewRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);

      try {
        const token = getToken();

        if (!token) {
          console.error("Không tìm thấy token đăng nhập!");
          return;
        }

        const response = await axios.get(
          `${API_URL}/teacher/lessons/${lessonId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let lessonData = response.data;

        // BƯỚC XỬ LÝ MỚI: Lọc bỏ file ZIP/RAR gốc chưa giải nén
        if (lessonData.files && lessonData.files.length > 0) {
          lessonData.files = lessonData.files.filter((file) => {
            const isArchive = file.fileType === "ZIP" || file.fileType === "RAR";
            // Nếu là file nén (iSpring), chỉ giữ lại bản đã giải nén (isRoot = true)
            // Nếu là các loại file khác (PDF, Word), giữ lại bình thường
            return isArchive ? file.isRoot === true : true;
          });
        }

        setLesson(lessonData);

        if (lessonData.files && lessonData.files.length > 0) {
          const firstPreviewable = lessonData.files.find((file) =>
            getPreviewUrl(file)
          );

          if (firstPreviewable) {
            handleViewFile(firstPreviewable);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết bài học:", error);

        if (
          error.response &&
          (error.response.status === 403 || error.response.status === 401)
        ) {
          alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line
  }, [lessonId]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await previewRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleViewFile = (file) => {
    const url = getPreviewUrl(file);

    if (!url) {
      alert("Định dạng này chưa hỗ trợ xem trước!");
      return;
    }

    setPreview({
      type: file.fileType,
      url,
      id: file.id,
    });
  };

  const getFileIcon = (fileType, fileName = "") => {
    const type = String(fileType || "").toUpperCase();
    const name = String(fileName || "").toLowerCase();

    if (type === "PDF" || name.endsWith(".pdf")) {
      return <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />;
    }

    if (type === "HTML" || name.endsWith(".html") || name.endsWith(".htm")) {
      return <HtmlIcon sx={{ color: "#e65100" }} />;
    }

    if (isWordFile(type, name)) {
      return <ArticleIcon sx={{ color: "#1565c0" }} />;
    }

    if (isPowerPointFile(type, name)) {
      return <SlideshowIcon sx={{ color: "#d84315" }} />;
    }

    if (isExcelFile(type, name)) {
      return <TableChartIcon sx={{ color: "#2e7d32" }} />;
    }

    if (type === "ZIP" || type === "RAR") {
      // Đã đổi icon cho bài giảng HTML5 thành dạng Slideshow trông đẹp mắt hơn Archive
      return <SlideshowIcon sx={{ color: "#6a1b9a" }} />;
    }

    return <DescriptionIcon sx={{ color: theme.palette.primary.main }} />;
  };

  const renderPreview = () => {
    if (!preview) {
      return (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            height: "100%",
            color: "text.secondary",
            bgcolor: "#f9fafb",
          }}
        >
          <DescriptionIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" fontWeight={500}>
            Chưa chọn tài liệu
          </Typography>
          <Typography variant="body2">
            Vui lòng chọn một file từ danh sách bên phải để xem trước
          </Typography>
        </Stack>
      );
    }

    return (
      <iframe
        src={preview.url}
        title="preview"
        width="100%"
        height="100%"
        style={{ border: "none", backgroundColor: "#fff" }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f4f6f8",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Không tìm thấy bài học
        </Typography>
        <Button onClick={() => navigate(-1)} variant="contained">
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        pb: 4,
        pt: 3,
        px: { xs: 2, md: 4 },
      }}
    >
      {!isFullscreen && (
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate("/teacher/courses")}
              sx={{ cursor: "pointer" }}
            >
              Khóa học của tôi
            </Link>
            <Typography color="text.primary">Chi tiết bài học</Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            size="small"
            sx={{ bgcolor: "white" }}
          >
            Quay lại
          </Button>
        </Box>
      )}

      {!isFullscreen && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="flex-start"
            >
              <Avatar
                variant="rounded"
                src={getFileUrl(lesson.coverImage)}
                sx={{
                  width: 140,
                  height: 100,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "2px solid white",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <DescriptionIcon />
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: "#1a237e", mb: 1 }}
                >
                  {lesson.name}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                  <Chip
                    label={`Mã: ${lesson.code}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={getGradeLabel(lesson.grade)}
                    color="secondary"
                    size="small"
                  />
                  <Chip label={`Tháng ${lesson.teachingMonth}`} size="small" />
                  <Chip
                    label={`${lesson.files?.length || 0} tài liệu`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.dark,
                    }}
                  />
                </Stack>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {lesson.description || "Chưa có mô tả cho bài học này."}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
        sx={{ height: isFullscreen ? "100vh" : "auto" }}
      >
        <Paper
          ref={previewRef}
          elevation={isFullscreen ? 0 : 2}
          sx={{
            flex: 1,
            height: isFullscreen ? "100vh" : 750,
            display: "flex",
            flexDirection: "column",
            borderRadius: isFullscreen ? 0 : 3,
            overflow: "hidden",
            bgcolor: "white",
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 0 : "auto",
            left: isFullscreen ? 0 : "auto",
            zIndex: isFullscreen ? 1300 : 1,
            width: isFullscreen ? "100%" : "auto",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              p: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "#f8f9fa",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <VisibilityIcon color="action" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {preview
                  ? "Đang xem: " +
                    (lesson.files?.find((f) => f.id === preview.id)?.fileName ||
                      "Tài liệu")
                  : "Trình xem tài liệu"}
              </Typography>
            </Stack>

            <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ flex: 1, bgcolor: "#e0e0e0", position: "relative" }}>
            {renderPreview()}
          </Box>
        </Paper>

        {!isFullscreen && (
          <Paper
            sx={{
              width: { xs: "100%", lg: 400 },
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              maxHeight: 750,
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={700}>
                Danh sách tài liệu
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tổng cộng {lesson.files?.length || 0} file đính kèm
              </Typography>
            </Box>

            <List sx={{ overflowY: "auto", flex: 1, p: 2 }}>
              {lesson.files?.map((file) => {
                const isSelected = preview?.id === file.id;
                const previewUrl = getPreviewUrl(file);

                return (
                  <ListItem key={file.id} disablePadding sx={{ mb: 1.5 }}>
                    <Box
                      sx={{
                        width: "100%",
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: isSelected
                          ? theme.palette.primary.main
                          : "transparent",
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.05)
                          : "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "#f9fafb",
                          borderColor: theme.palette.divider,
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.grey[200], 0.5),
                            display: "flex",
                          }}
                        >
                          {getFileIcon(file.fileType, file.fileName)}
                        </Box>

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            cursor: previewUrl ? "pointer" : "default",
                          }}
                          onClick={() => handleViewFile(file)}
                        >
                          <Typography
                            variant="subtitle2"
                            noWrap
                            fontWeight={isSelected ? 700 : 500}
                            color={isSelected ? "primary" : "text.primary"}
                            title={file.fileName}
                          >
                            {/* Chỉnh lại tên hiển thị cho đẹp, bỏ các đuôi .zip .rar nếu là bài giảng iSpring */}
                            {file.fileType === "ZIP" || file.fileType === "RAR"
                              ? file.fileName.replace(/\.(zip|rar)$/i, "")
                              : file.fileName}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {file.fileType === "ZIP" || file.fileType === "RAR"
                              ? "Bài giảng tương tác"
                              : file.fileType}{" "}
                            •{" "}
                            {file.fileSize
                              ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : "File"}
                          </Typography>
                        </Box>

                        <Tooltip title="Xem trước">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleViewFile(file)}
                              color={isSelected ? "primary" : "default"}
                              disabled={!previewUrl}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </ListItem>
                );
              })}

              {(!lesson.files || lesson.files.length === 0) && (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    Không có tài liệu nào.
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}