"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Radio,
  Stack,
  RadioGroup,
  Card,
  CircularProgress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CardBody,
} from "@chakra-ui/react";
import supabase from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@chakra-ui/icons";

const FeedbackForm = ({
  classroomId,
  subjectId,
  onNext,
  onPrevious,
  isLastStep,
  formId,
  studentId,
  isFirstStep,
}) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [subject, setSubject] = useState();
  const [faculty, setFaculty] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFormAlreadySubmitted, setIsFormAlreadySubmitted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchResponses = async () => {
      const { data: responsesData } = await supabase
        .from("response_table")
        .select("*")
        .eq("classroom_id", classroomId?.toString())
        .eq("form_id", formId?.toString())
        .eq("student_id", studentId?.toString())
        .eq("subject_id", subjectId?.toString());

      if (responsesData.length) {
        setIsFormAlreadySubmitted(true);
      }
    };

    fetchResponses();
    const fetchQuestions = async () => {
      setLoading(true);
      const { data: subjectData } = await supabase
        .from("classroom_subjects")
        .select("*")
        .eq("classroom_id", classroomId?.toString())
        .eq("id", subjectId?.toString());

      setSubject(subjectData[0]);

      const { data: facultyData } = await supabase
        .from("faculty_table")
        .select("*")
        .eq("faculty_id", subjectData[0]?.handling_instructor);

      setFaculty(facultyData[0]);

      const { data: questionsData } = await supabase
        .from("question_table")
        .select("*");

      setQuestions(questionsData || []);
      setLoading(false);
    };

    fetchQuestions();
  }, [classroomId, subjectId]);

  const handleRadioChange = (questionId, option) => {
    const newResponses = responses.filter((r) => r.question_id !== questionId);
    newResponses.push({ question_id: questionId, option: option });
    setResponses(newResponses);
  };

  const handleDeleteResponse = async () => {
    if (confirm("Are you sure you want to delete your response?")) {
      const { error: deleteError } = await supabase
        .from("response_table")
        .delete()
        .eq("classroom_id", classroomId?.toString())
        .eq("form_id", formId?.toString())
        .eq("student_id", studentId?.toString());
      if (!deleteError) {
        alert("Response deleted successfully!");
        router.push("/student");
      }
    }
  };
  const handleSubmit = async () => {
    // Submit responses to the responses table
    console.log("Responses:", responses);

    const isFormComplete = questions.every((question) =>
      responses.some(
        (response) => response.question_id === question.question_id
      )
    );

    if (!isFormComplete) {
      setError("Please answer all questions before submitting.");
      return;
    } else {
      setError(null);
    }

    const { error: submitError } = await supabase
      .from("response_table")
      .insert({
        classroom_id: classroomId,
        response: responses,
        form_id: formId,
        subject_id: subjectId,
        student_id: studentId,
      });

    if (!isLastStep) {
      setQuestions();
      onNext();
    } else {
      if (!submitError) alert("Feedback submitted successfully!");
      router.push("/student");
    }
  };

  const handleGoBack = () => {
    onPrevious();
    setQuestions();
  };

  if (isFormAlreadySubmitted) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Card className="flex max-w-[400px]  flex-col w-full items-center  justify-center">
          <CardBody className=" flex p-32  flex-col items-center justify-center rounded">
            <CheckCircleIcon className="text-[100px] mb-2" />
            <Heading className="text-xl">Feedback already submitted!</Heading>
            <Text py="2">
              You have already submitted feedback for this form.
            </Text>
            <div className="flex  items-center justify-center flex-row gap-2">
              <Button
                colorScheme={"blue"}
                onClick={() => router.push("/student")}
              >
                Back to home
              </Button>

              <Button
                colorScheme={"red"}
                variant={"outline"}
                onClick={handleDeleteResponse}
              >
                Delete Response
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Box
        p={4}
        className="flex flex-col w-full items-center h-screen justify-center"
      >
        <CircularProgress isIndeterminate color="blue.500" />
      </Box>
    );
  }

  return (
    <Box p={4} className="flex flex-col w-full items-center justify-center">
      <div className="max-w-[450px]">
        <Heading as="h1" size="xl">
          {subject?.subject_name}
        </Heading>
        <Text className="my-4 font-semibold">Instructor: {faculty?.name}</Text>
        {questions?.map((question) => (
          <Card key={question.question_id} mb={4} padding={4}>
            <Heading as="h3" size="md" mb={2}>
              {question.question_name}
            </Heading>

            <RadioGroup
              onChange={(value) =>
                handleRadioChange(question.question_id, value)
              }
            >
              <Stack spacing={2}>
                {question.question_options.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Card>
        ))}

        {error && (
          <Alert status="error" className="my-4 rounded">
            <AlertIcon />

            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-row gap-4">
          <Button onClick={handleGoBack} isDisabled={isFirstStep}>
            Back
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default FeedbackForm;
