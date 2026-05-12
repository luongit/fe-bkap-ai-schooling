import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/apiToken";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DescriptionIcon from "@mui/icons-material/Description";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  Divider,
  Pagination,
  useTheme,
  alpha,
} from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
const LESSON_PAGE_SIZE = 8;

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

function parseCourseVideos(videoUrl) {
  if (!videoUrl) return [];

  if (Array.isArray(videoUrl)) {
    return videoUrl.filter((item) => item && item.url);
  }

  try {
    const parsed = JSON.parse(videoUrl);

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && typeof item.url === "string")
        .map((item) => ({
          title: typeof item.title === "string" ? item.title : "",
          description:
            typeof item.description === "string" ? item.description : "",
          url: item.url,
        }));
    }

    if (parsed && Array.isArray(parsed.videos)) {
      return parsed.videos.filter((item) => item && item.url);
    }

    return [];
  } catch {
    if (typeof videoUrl === "string" && videoUrl.startsWith("http")) {
      return [
        {
          title: "Video giới thiệu khóa học",
          description: "",
          url: videoUrl,
        },
      ];
    }

    return [];
  }
}

function getYoutubeVideoId(url) {
  try {
    const cleanUrl = String(url || "").trim();

    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?&]+)/,
      /(?:youtube\.com\/embed\/)([^?&]+)/,
      /(?:youtube\.com\/shorts\/)([^?&]+)/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        return match[1].split("?")[0].split("&")[0];
      }
    }

    return "";
  } catch {
    return "";
  }
}

function getYoutubeEmbedUrl(url) {
  const id = getYoutubeVideoId(url);

  if (!id) return "";

  return `https://www.youtube.com/embed/${id}`;
}

function getYoutubeThumbnail(url) {
  const id = getYoutubeVideoId(url);

  if (!id) return "";

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [lessonPage, setLessonPage] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const videos = useMemo(() => {
    return parseCourseVideos(course?.videoUrl);
  }, [course?.videoUrl]);

  const selectedVideo = videos[selectedVideoIndex] || null;

  const selectedEmbedUrl = selectedVideo
    ? getYoutubeEmbedUrl(selectedVideo.url)
    : "";

  const canPrevVideo = selectedVideoIndex > 0;
  const canNextVideo = selectedVideoIndex < videos.length - 1;

  const totalLessonPages = totalPages;

  const pagedLessons = lessons;

  const fetchData = async () => {
    setLoading(true);

    try {
      let courseData = null;
      try {
        const courseRes = await api.get(`/teacher/courses/${courseId}`);
        courseData = courseRes.data;
      } catch {
        const listRes = await api.get("/teacher/courses");

        courseData = (listRes.data.content || []).find(
          (item) => String(item.id) === String(courseId)
        );
      }

      const lessonsRes = await api.get(
        `/teacher/courses/${courseId}/lessons`,
        {
          params: {
            page: lessonPage - 1,
            size: LESSON_PAGE_SIZE,
          },
        }
      );

      const lessonsData = lessonsRes.data;

      setCourse(courseData || null);
      setLessons(lessonsData.content || []);
      setTotalLessons(lessonsData.totalElements || 0);
      setTotalPages(lessonsData.totalPages || 1);
      setSelectedVideoIndex(0);
    } catch (error) {
      console.error("Lỗi tải chi tiết khóa học:", error);

      if (
        error.response &&
        (error.response.status === 403 || error.response.status === 401)
      ) {
        alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }

      setCourse(null);
      setLessons([]);
      setLessonPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [courseId, lessonPage]);

  const handlePrevVideo = () => {
    if (!canPrevVideo) return;
    setSelectedVideoIndex((prev) => prev - 1);
  };

  const handleNextVideo = () => {
    if (!canNextVideo) return;
    setSelectedVideoIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f4f6f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Không tìm thấy khóa học
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/teacher/courses")}
        >
          Quay lại danh sách
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
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
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

          <Typography color="text.primary">Chi tiết khóa học</Typography>
        </Breadcrumbs>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/teacher/courses")}
            variant="outlined"
            size="small"
            sx={{ bgcolor: "white" }}
          >
            Quay lại
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            variant="outlined"
            size="small"
            sx={{ bgcolor: "white" }}
          >
            Làm mới
          </Button>
        </Stack>
      </Box>
      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
            bgcolor: "#eef4ff",
          }}
        >
          {course.coverImage ? (
            <>
              <Box
                component="img"
                src={getFileUrl(course.coverImage)}
                alt=""
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "80%",
                  objectFit: "cover",
                  filter: "blur(18px)",
                  transform: "scale(1.08)",
                  opacity: 0.45,
                }}
              />

              <Box
                component="img"
                src={getFileUrl(course.coverImage)}
                alt={course.name}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center center",
                  display: "block",
                }}
              />
            </>
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ height: "100%" }}
            >
              <SchoolIcon
                sx={{
                  fontSize: 72,
                  color: alpha(theme.palette.primary.main, 0.45),
                }}
              />
            </Stack>
          )}
        </Box>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box
              sx={{
                minWidth: 104,
                height: 64,
                px: 2,
                borderRadius: 3,
                bgcolor: theme.palette.primary.main,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                textAlign: "center",
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {getGradeLabel(course.grade)}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  color: "#1a237e",
                  mb: 1,
                  fontSize: { xs: 26, md: 34 },
                  lineHeight: 1.2,
                }}
              >
                {course.name}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 2 }}
              >
                <Chip label={getGradeLabel(course.grade)} color="primary" />
                <Chip label={`Tháng ${course.teachingMonth}`} color="secondary" />
                <Chip
                  label={`${totalLessons} bài học`}
                  icon={<MenuBookIcon />}
                  variant="outlined"
                />

                {videos.length > 0 && (
                  <Chip
                    label={`${videos.length} video`}
                    icon={<PlayCircleIcon />}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.08),
                      color: theme.palette.error.dark,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  lineHeight: 1.7,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {course.description || "Chưa có mô tả khóa học."}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: "#1a237e" }}
              >
                Video giới thiệu / hướng dẫn
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Xem lần lượt các video trong khóa học
              </Typography>
            </Box>

            {videos.length > 0 && (
              <Chip
                label={`${selectedVideoIndex + 1} / ${videos.length} video`}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.dark,
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>

          {videos.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                bgcolor: "#fafafa",
              }}
            >
              <PlayCircleIcon
                sx={{ fontSize: 44, color: "text.disabled", mb: 1 }}
              />
              <Typography color="text.secondary">
                Chưa có video cho khóa học này.
              </Typography>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 360px" },
                gap: 3,
              }}
            >
              <Box>
                <Box
                  sx={{
                    overflow: "hidden",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "black",
                    boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      pt: "56.25%",
                    }}
                  >
                    {selectedEmbedUrl ? (
                      <iframe
                        src={selectedEmbedUrl}
                        title={
                          selectedVideo?.title ||
                          `Video ${selectedVideoIndex + 1}`
                        }
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          color: "white",
                        }}
                      >
                        <PlayCircleIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Typography>Không thể hiển thị video</Typography>
                      </Stack>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ color: "text.primary" }}
                  >
                    {selectedVideo?.title ||
                      `Video ${selectedVideoIndex + 1}`}
                  </Typography>

                  {selectedVideo?.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, lineHeight: 1.7 }}
                    >
                      {selectedVideo.description}
                    </Typography>
                  )}

                  {selectedVideo?.url && (
                    <Typography
                      component="a"
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "primary.main",
                        textDecoration: "none",
                        wordBreak: "break-all",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {selectedVideo.url}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ChevronLeftIcon />}
                    disabled={!canPrevVideo}
                    onClick={handlePrevVideo}
                    sx={{ borderRadius: 2 }}
                  >
                    Video trước
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={<ChevronRightIcon />}
                    disabled={!canNextVideo}
                    onClick={handleNextVideo}
                    sx={{ borderRadius: 2 }}
                  >
                    Video tiếp theo
                  </Button>
                </Stack>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  bgcolor: "#fafafa",
                  height: "fit-content",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "white",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography fontWeight={800} sx={{ color: "#1a237e" }}>
                    Danh sách video
                  </Typography>
                </Box>

                <Stack
                  spacing={1.5}
                  sx={{
                    p: 1.5,
                    maxHeight: { xs: "auto", xl: 560 },
                    overflowY: "auto",
                  }}
                >
                  {videos.map((video, index) => {
                    const active = index === selectedVideoIndex;
                    const thumbnail = getYoutubeThumbnail(video.url);

                    return (
                      <Box
                        key={`${video.url}-${index}`}
                        component="button"
                        type="button"
                        onClick={() => setSelectedVideoIndex(index)}
                        sx={{
                          width: "100%",
                          p: 0,
                          textAlign: "left",
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: active
                            ? theme.palette.primary.main
                            : "divider",
                          bgcolor: active
                            ? alpha(theme.palette.primary.main, 0.07)
                            : "white",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: active
                            ? "0px 4px 14px rgba(25,118,210,0.18)"
                            : "0px 2px 8px rgba(0,0,0,0.04)",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ p: 1.2 }}>
                          <Box
                            sx={{
                              width: 116,
                              minWidth: 116,
                              height: 68,
                              borderRadius: 2,
                              overflow: "hidden",
                              bgcolor: "#ddd",
                              position: "relative",
                            }}
                          >
                            {thumbnail ? (
                              <Box
                                component="img"
                                src={thumbnail}
                                alt={video.title || `Video ${index + 1}`}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Stack
                                alignItems="center"
                                justifyContent="center"
                                sx={{ height: "100%" }}
                              >
                                <PlayCircleIcon color="disabled" />
                              </Stack>
                            )}

                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                bgcolor: "rgba(0,0,0,0.18)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PlayCircleIcon
                                sx={{
                                  color: "white",
                                  fontSize: 34,
                                  filter:
                                    "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                position: "absolute",
                                top: 6,
                                left: 6,
                                bgcolor: "rgba(0,0,0,0.7)",
                                color: "white",
                                fontSize: 11,
                                fontWeight: 700,
                                px: 0.8,
                                py: 0.2,
                                borderRadius: 99,
                              }}
                            >
                              {index + 1}
                            </Box>
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              fontWeight={800}
                              sx={{
                                color: active
                                  ? "primary.main"
                                  : "text.primary",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                fontSize: 14,
                                lineHeight: 1.35,
                              }}
                            >
                              {video.title || `Video ${index + 1}`}
                            </Typography>

                            {video.description ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mt: 0.5,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {video.description}
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  mt: 0.5,
                                  display: "block",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {video.url}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={1}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: "#1a237e" }}
                >
                  Danh sách bài học
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Chọn bài học để xem tài liệu chi tiết
                </Typography>
              </Box>

              {totalLessons > 0 && (
                <Chip
                  label={`${totalLessons} bài học`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.dark,
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
          </Box>

          <List sx={{ p: 2 }}>
            {pagedLessons.length > 0 ? (
              pagedLessons.map((lesson, index) => {
                const globalIndex =
                  (lessonPage - 1) * LESSON_PAGE_SIZE + index;

                return (
                  <React.Fragment key={lesson.id}>
                    <ListItem
                      onClick={() => navigate(`/teacher/lessons/${lesson.id}`)}
                      sx={{
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ width: "100%" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.dark,
                            fontWeight: 800,
                          }}
                        >
                          {lesson.lessonOrder || globalIndex + 1}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>
                            {lesson.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {lesson.code} • {getGradeLabel(lesson.grade)} •
                            Tháng {lesson.teachingMonth}
                          </Typography>
                        </Box>

                        <DescriptionIcon color="action" />
                      </Stack>
                    </ListItem>

                    {index < pagedLessons.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: "center",
                  borderRadius: 3,
                  bgcolor: "#fafafa",
                }}
              >
                <Typography color="text.secondary">
                  Chưa có bài học nào trong khóa học này.
                </Typography>
              </Paper>
            )}
          </List>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ px: 2, pb: 3 }}>
              <Pagination
                count={totalLessonPages}
                page={lessonPage}
                onChange={(_, value) => setLessonPage(value)}
                color="primary"
                size="medium"
                shape="rounded"
                showFirstButton
                showLastButton
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Trang {lessonPage} / {totalLessonPages} • Tổng{" "}
                {totalLessons} bài học
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}