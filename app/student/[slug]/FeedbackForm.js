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
} from "@chakra-ui/react";
import supabase from "../../../lib/supabase";
import { useRouter } from "next/navigation";

const FeedbackForm = ({
  classroomId,
  subjectId,
  onNext,
  onPrevious,
  isLastStep,
  formId,
  studentId,
}) => {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [subject, setSubject] = useState();
  const [faculty, setFaculty] = useState();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
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

  const handleSubmit = async () => {
    // Submit responses to the responses table
    console.log("Responses:", responses);

    const { data, error } = await supabase.from("response_table").insert({
      classroom_id: classroomId,
      response: responses,
      form_id: formId,
      subject_id: subjectId,
      student_id: studentId,
    });

    setQuestions();

    if (!isLastStep) {
      onNext();
    } else {
      alert("Feedback submitted successfully!");
      router.push("/student");
    }
  };

  const handleGoBack = () => {
    onPrevious();
    setQuestions();
  };

  if (loading) {
    return (
      <Box p={4} className="flex flex-col w-full items-center justify-center">
        <div className="max-w-[450px]">
          <Heading as="h1" size="xl">
            Loading...
          </Heading>
        </div>
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
        <div className="flex flex-row gap-4">
          <Button onClick={handleGoBack}>Back</Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default FeedbackForm;
