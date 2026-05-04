import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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

  const videos = useMemo(() => {
    return parseCourseVideos(course?.videoUrl);
  }, [course?.videoUrl]);

  const selectedVideo = videos[selectedVideoIndex] || null;

  const selectedEmbedUrl = selectedVideo
    ? getYoutubeEmbedUrl(selectedVideo.url)
    : "";

  const canPrevVideo = selectedVideoIndex > 0;
  const canNextVideo = selectedVideoIndex < videos.length - 1;

  const totalLessonPages = Math.max(
    1,
    Math.ceil(lessons.length / LESSON_PAGE_SIZE)
  );

  const pagedLessons = useMemo(() => {
    const start = (lessonPage - 1) * LESSON_PAGE_SIZE;
    return lessons.slice(start, start + LESSON_PAGE_SIZE);
  }, [lessons, lessonPage]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        console.error("Không tìm thấy token đăng nhập!");
        return;
      }

      let courseData = null;

      try {
        const courseRes = await axios.get(
          `${API_URL}/teacher/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        courseData = courseRes.data;
      } catch {
        const listRes = await axios.get(`${API_URL}/teacher/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        courseData = (listRes.data || []).find(
          (item) => String(item.id) === String(courseId)
        );
      }

      const lessonsRes = await axios.get(
        `${API_URL}/teacher/courses/${courseId}/lessons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourse(courseData || null);
      setLessons(lessonsRes.data || []);
      setSelectedVideoIndex(0);
      setLessonPage(1);
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
  }, [courseId]);

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
        }}
      >
        <Box
          sx={{
            height: { xs: 180, md: 260 },
            bgcolor: alpha(theme.palette.primary.main, 0.08),
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
                objectFit: "cover",
              }}
            />
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

        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems="flex-start"
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 72,
                height: 72,
                bgcolor: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: 24,
                borderRadius: 3,
              }}
            >
              {course.grade}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ color: "#1a237e", mb: 1 }}
              >
                {course.name}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                <Chip label={`Khối ${course.grade}`} color="primary" />
                <Chip
                  label={`Tháng ${course.teachingMonth}`}
                  color="secondary"
                />
                <Chip
                  label={`${lessons.length} bài học`}
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
                sx={{ lineHeight: 1.7 }}
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

              {lessons.length > 0 && (
                <Chip
                  label={`${lessons.length} bài học`}
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
                            {lesson.code} • Khối {lesson.grade} • Tháng{" "}
                            {lesson.teachingMonth}
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

          {lessons.length > LESSON_PAGE_SIZE && (
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
                Trang {lessonPage} / {totalLessonPages} • Tổng {lessons.length} bài học
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}