import React, { useEffect, useState, useRef } from "react";
import api from "../../services/apiToken";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArticleIcon from "@mui/icons-material/Article";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TableChartIcon from "@mui/icons-material/TableChart";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const HIDE_ISPRING_MENU_SCALE = 1.14;

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

function getServerUrl() {
  const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8080/api";
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

function isHtmlFile(fileType, fileName) {
  return (
    fileType === "HTML" ||
    fileName.endsWith(".html") ||
    fileName.endsWith(".htm")
  );
}

function isArchiveFile(fileType) {
  return fileType === "ZIP" || fileType === "RAR";
}

function isInteractiveLessonFile(file) {
  if (!file) return false;

  const fileType = String(file.fileType || "").toUpperCase();
  const fileName = String(file.fileName || "").toLowerCase();

  return isHtmlFile(fileType, fileName) || isArchiveFile(fileType);
}

function getPreviewUrl(file) {
  if (!file) return "";

  const fileType = String(file.fileType || "").toUpperCase();
  const fileName = String(file.fileName || "").toLowerCase();

  if (fileType === "PDF" || fileName.endsWith(".pdf")) {
    return getFileUrl(file.filePath);
  }

  if (isHtmlFile(fileType, fileName)) {
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

  if (isArchiveFile(fileType)) {
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
  const [previewScale, setPreviewScale] = useState(1);

  const iframeRef = useRef(null);
  const previewBoxRef = useRef(null);
  const previewPanelRef = useRef(null);

  const shouldHideISpringMenu =
    preview?.isInteractive && previewScale >= HIDE_ISPRING_MENU_SCALE;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/teacher/lessons/${lessonId}`);

        let lessonData = response.data;

        if (lessonData.files && lessonData.files.length > 0) {
          lessonData.files = lessonData.files.filter((file) => {
            const isArchive =
              file.fileType === "ZIP" || file.fileType === "RAR";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    try {
      const doc =
        iframeRef.current?.contentDocument ||
        iframeRef.current?.contentWindow?.document;

      applyISpringMenuVisibility(doc);
    } catch (error) {
      // Khác origin thì không sửa được iframe.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewScale, preview?.id, preview?.isInteractive]);

  const toggleFullscreen = async () => {
    const target =
      previewPanelRef.current || previewBoxRef.current || iframeRef.current;

    if (!target) return;

    if (!document.fullscreenElement) {
      await target.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const applyISpringMenuVisibility = (doc) => {
    if (!doc?.body) return;

    const shouldHide =
      preview?.isInteractive && previewScale >= HIDE_ISPRING_MENU_SCALE;

    if (shouldHide) {
      doc.body.classList.add("bkap-hide-ispring-menu");
    } else {
      doc.body.classList.remove("bkap-hide-ispring-menu");
    }
  };

  const moveISpringRightControlsToBottom = (doc) => {
    try {
      const win = doc.defaultView || iframeRef.current?.contentWindow;

      if (!win) return;

      const markControls = () => {
        const candidates = Array.from(
          doc.querySelectorAll("button, a, [role='button'], div, span")
        );

        const floatingItems = candidates.filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = win.getComputedStyle(element);

          const isSmall =
            rect.width >= 18 &&
            rect.width <= 90 &&
            rect.height >= 18 &&
            rect.height <= 90;

          const isNearRight = rect.left > win.innerWidth - 140;

          const isVisible =
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity || 1) > 0;

          const isClickable =
            style.cursor === "pointer" ||
            element.tagName === "BUTTON" ||
            element.tagName === "A" ||
            element.getAttribute("role") === "button" ||
            typeof element.onclick === "function";

          return isSmall && isNearRight && isVisible && isClickable;
        });

        floatingItems.forEach((element, index) => {
          element.classList.add("bkap-ispring-bottom-control");

          if (index >= 4) {
            element.classList.add("bkap-ispring-control-extra");
          } else {
            element.classList.remove("bkap-ispring-control-extra");
          }

          element.style.setProperty("--bkap-control-index", String(index));
        });

        applyISpringMenuVisibility(doc);
      };

      markControls();

      const observer = new MutationObserver(() => {
        markControls();
      });

      observer.observe(doc.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      setTimeout(markControls, 300);
      setTimeout(markControls, 800);
      setTimeout(markControls, 1500);
    } catch (error) {
      // Bỏ qua nếu iframe khác origin.
    }
  };

  const handleIframeLoad = () => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!doc) return;

      const oldStyle = doc.getElementById("custom-ispring-fit-style");

      if (oldStyle) {
        oldStyle.remove();
      }

      const style = doc.createElement("style");
      style.id = "custom-ispring-fit-style";

      style.innerHTML = `
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          background: #fff !important;
        }

        body > * {
          max-width: none !important;
        }

        #content,
        #player,
        #playerView,
        #presentation,
        #ispringPlayer,
        #slideView,
        #slide,
        .player,
        .ispring-player,
        .presentation,
        .slide-player,
        .content,
        .slide-view {
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          max-height: none !important;
          margin: 0 auto !important;
        }

        iframe,
        canvas,
        video {
          max-width: none !important;
        }

        .bkap-ispring-bottom-control {
          position: fixed !important;
          top: auto !important;
          right: auto !important;
          left: calc(50% - 70px + (var(--bkap-control-index, 0) * 46px)) !important;
          bottom: 18px !important;
          z-index: 999999 !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: none !important;
        }

        .bkap-ispring-control-extra {
          display: none !important;
        }

        body.bkap-hide-ispring-menu .bkap-ispring-bottom-control,
        body.bkap-hide-ispring-menu [style*="right: 0"],
        body.bkap-hide-ispring-menu [style*="right:0"],
        body.bkap-hide-ispring-menu [style*="right: 8px"],
        body.bkap-hide-ispring-menu [style*="right:8px"],
        body.bkap-hide-ispring-menu [style*="right: 10px"],
        body.bkap-hide-ispring-menu [style*="right:10px"],
        body.bkap-hide-ispring-menu [class*="sidebar"],
        body.bkap-hide-ispring-menu [class*="side-bar"],
        body.bkap-hide-ispring-menu [class*="navigation"],
        body.bkap-hide-ispring-menu [class*="Navigation"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `;

      doc.head.appendChild(style);
      moveISpringRightControlsToBottom(doc);
      applyISpringMenuVisibility(doc);
    } catch (error) {
      // Nếu React ở localhost:3000 còn file ở localhost:8080
      // thì browser có thể chặn sửa CSS bên trong iframe.
    }
  };

  const handleViewFile = (file) => {
    const url = getPreviewUrl(file);

    if (!url) {
      alert("Định dạng này chưa hỗ trợ xem trước!");
      return;
    }

    const fileType = String(file.fileType || "").toUpperCase();

    setPreview({
      type: fileType,
      url,
      id: file.id,
      fileName: file.fileName,
      isInteractive: isInteractiveLessonFile(file),
    });

    setPreviewScale(isInteractiveLessonFile(file) ? 1.08 : 1);
  };

  const handleZoomIn = () => {
    setPreviewScale((current) =>
      Math.min(Number((current + 0.05).toFixed(2)), 1.3)
    );
  };

  const handleZoomOut = () => {
    setPreviewScale((current) =>
      Math.max(Number((current - 0.05).toFixed(2)), 0.9)
    );
  };

  const handleResetZoom = () => {
    setPreviewScale(preview?.isInteractive ? 1.08 : 1);
  };

  const getFileIcon = (fileType, fileName = "") => {
    const type = String(fileType || "").toUpperCase();
    const name = String(fileName || "").toLowerCase();

    if (type === "PDF" || name.endsWith(".pdf")) {
      return <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />;
    }

    if (isHtmlFile(type, name)) {
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

    if (isArchiveFile(type)) {
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
        ref={iframeRef}
        src={preview.url}
        title="preview"
        width="100%"
        height="100%"
        onLoad={handleIframeLoad}
        style={{
          border: "none",
          backgroundColor: "#fff",
          display: "block",
          width: "100%",
          height: "100%",
          transform: `scale(${previewScale})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease",
        }}
        allowFullScreen
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

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        <Paper
          ref={previewPanelRef}
          elevation={2}
          sx={{
            flex: 1,
            height: {
              xs: "72vh",
              lg: "calc(100vh - 250px)",
            },
            minHeight: 650,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "white",

            "&:fullscreen": {
              width: "100vw",
              height: "100vh",
              minHeight: "100vh",
              maxHeight: "100vh",
              borderRadius: 0,
              bgcolor: "white",
            },
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
              gap: 1,
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <VisibilityIcon color="action" fontSize="small" />

              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary"
                noWrap
              >
                {preview
                  ? `Đang xem: ${preview.fileName || "Tài liệu"}`
                  : "Trình xem tài liệu"}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title="Thu nhỏ slide">
                <span>
                  <IconButton
                    onClick={handleZoomOut}
                    size="small"
                    disabled={!preview}
                  >
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={
                  shouldHideISpringMenu
                    ? "Menu iSpring đang được ẩn do zoom lớn"
                    : `Tỷ lệ: ${Math.round(previewScale * 100)}%`
                }
              >
                <Box
                  sx={{
                    px: 1,
                    minWidth: 48,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: shouldHideISpringMenu
                      ? theme.palette.warning.dark
                      : "text.secondary",
                  }}
                >
                  {Math.round(previewScale * 100)}%
                </Box>
              </Tooltip>

              <Tooltip title="Phóng to slide">
                <span>
                  <IconButton
                    onClick={handleZoomIn}
                    size="small"
                    disabled={!preview}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Reset tỷ lệ">
                <span>
                  <IconButton
                    onClick={handleResetZoom}
                    size="small"
                    disabled={!preview}
                  >
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                <span>
                  <IconButton
                    onClick={toggleFullscreen}
                    size="small"
                    disabled={!preview}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          <Box
            ref={previewBoxRef}
            sx={{
              flex: 1,
              bgcolor: "#fff",
              position: "relative",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {renderPreview()}

            {shouldHideISpringMenu && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: {
                    xs: 58,
                    md: isFullscreen ? 96 : 72,
                  },
                  bgcolor: "#fff",
                  zIndex: 4,
                  pointerEvents: "auto",
                  borderLeft: "1px solid rgba(0,0,0,0.03)",
                }}
              />
            )}
          </Box>
        </Paper>

        <Paper
          sx={{
            width: { xs: "100%", lg: 400 },
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            maxHeight: {
              xs: "none",
              lg: "calc(100vh - 250px)",
            },
            minHeight: {
              xs: "auto",
              lg: 650,
            },
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
              const fileType = String(file.fileType || "").toUpperCase();

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
                        onClick={() => {
                          if (previewUrl) handleViewFile(file);
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          noWrap
                          fontWeight={isSelected ? 700 : 500}
                          color={isSelected ? "primary" : "text.primary"}
                          title={file.fileName}
                        >
                          {isArchiveFile(fileType)
                            ? file.fileName.replace(/\.(zip|rar)$/i, "")
                            : file.fileName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {isArchiveFile(fileType)
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
      </Stack>
    </Box>
  );
}