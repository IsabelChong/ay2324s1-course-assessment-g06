import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Button, Container, Grid, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import { getCurrentUser } from "../services/auth.service";

interface QuestionInt {
  _id: string;
  title: string;
  frontendQuestionId: string;
  difficulty: string;
  content: string;
  category: string;
  topics: string;
}

interface AttemptInt {
  userId: number;
  question_id: string;
  difficulty: string;
  attemptedAt: string;
  attempt: string;
}

const QuestionWrapper = styled(Container)(({ theme }) => ({
  backgroundColor: "#d8d8d8",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  fontWeight: "bold",
  textAlign: "center",
  borderRadius: "50px",
  fontSize: "12px",
  // Media query for smaller screens
  "@media (max-width: 1200px)": {
    fontSize: "10px", // Decrease font size for smaller screens
  },
}));

const CategoryWrapper = styled(Container)(({ theme }) => ({
  backgroundColor: "rgb(255, 192, 203)",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  fontWeight: "bold",
  textAlign: "center",
  borderRadius: "50px",
  fontSize: "12px",
  // Media query for smaller screens
  "@media (max-width: 1200px)": {
    fontSize: "10px", // Decrease font size for smaller screens
  },
}));

const BackButton = styled(Button)`
  background-color: #d8d8d8;
  color: white;
  font-weight: bold;
  &:hover {
    background-color: #6c63ff;
  }
`;

export default function UserAttempt() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<QuestionInt | null>(null);
  const [attempt, setAttempt] = useState<AttemptInt>({
    userId: 0,
    question_id: "",
    difficulty: "",
    attemptedAt: "",
    attempt: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = getCurrentUser();
  const isAdmin = currentUser && currentUser.roles.includes("ROLE_ADMIN");

  const QUESTION_HOST =
    process.env.REACT_APP_QNS_SVC || "http://localhost:3000/api/questions";
  const USER_HISTORY =
    process.env.REACT_APP_USR_SVC_HIST || "http://localhost:3003/api/user";

  useEffect(() => {
    const fetchDataWithDelay = () => {
      fetch(QUESTION_HOST + `/${id}`, {
        headers: {
          "x-access-token": currentUser.accessToken,
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          setQuestion(responseData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setQuestion(null);
          setIsLoading(false);
        });
    };

    fetchDataWithDelay();
  }, [id, currentUser.accessToken]);

  useEffect(() => {
    const fetchUserAttempt = () => {
      fetch(USER_HISTORY + "/getall", {
        headers: {
          "x-access-token": currentUser.accessToken,
        },
      })
        .then((response) => response.json())
        .then((responseData) => {
          const targetData = responseData.find(
            (item: any) => item.question_id === `${id}`
          );
          console.log(targetData);
          setAttempt(targetData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching attempt:", error);
          setIsLoading(false);
        });
    };

    fetchUserAttempt();
  }, [id, currentUser.accessToken]);

  function wrapPreTags(content: string) {
    const wrappedContent = content.replace(/<pre>/g, '<pre class="pre-wrap">');
    return wrappedContent;
  }

  const handleBack = () => {
    console.log("navigated back to analytics");
    navigate("/analytics");
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress color="inherit" />
      </div>
    );
  }

  if (question === null) {
    return <div>Loading...</div>;
  }

  return (
    <Container
      maxWidth="lg"
      style={{
        margin: "40px auto 0 auto",
        backgroundColor: "#E6E6E6",
        borderRadius: "20px",
        width: "80%",
        padding: "20px",
      }}
    >
      <Paper
        style={{
          padding: "20px",
          borderRadius: "15px",
        }}
      >
        <Grid sx={{ flexGrow: 1 }} container spacing={1}>
          <Grid item xs={12} container justifyContent="space-between">
            <div>
              <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
                {question.title}
              </h1>
            </div>
          </Grid>

          <Grid item xs={1.5}>
            <CategoryWrapper>{question.difficulty}</CategoryWrapper>
          </Grid>

          {question.topics.split(", ").map((topic, index) => (
            <Grid
              item
              xs={topic.length < 10 ? 1.5 : topic.length < 14 ? 2 : 3}
              key={index}
            >
              <QuestionWrapper>{topic}</QuestionWrapper>
            </Grid>
          ))}

          <Container maxWidth="lg" style={{ marginTop: "25px" }}>
            <Grid item xs={12}>
              <div
                className="content-wrapper"
                style={{ overflow: "auto", maxHeight: "350px" }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: wrapPreTags(question.content),
                  }}
                />
                <p style={{ marginTop: "35px", fontWeight: "bold" }}>
                  Attempt:
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                    backgroundColor: "#EFEFEF",
                    borderRadius: "10px",
                    paddingTop: "40px",
                    paddingBottom: "40px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: wrapPreTags(attempt.attempt),
                  }}
                />
              </div>
            </Grid>
          </Container>
        </Grid>
      </Paper>

      <Grid item xs={12}>
        <BackButton
          sx={{
            position: "fixed",
            bottom: "30px",
            left: "30px",
            height: "32 px",
            fontSize: "25px",
            borderRadius: "40px",
            minWidth: "40px", // Set the minimum width
            maxWidth: "40px", // Set the maximum width
          }}
          variant="contained"
          onClick={handleBack}
        >
          <ArrowBackIcon />
        </BackButton>
      </Grid>
    </Container>
  );
}
