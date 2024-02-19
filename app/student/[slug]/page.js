"use client";

import React, { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import FeedbackForm from "./FeedbackForm"; // Assuming FeedbackForm component is in a separate file
import supabase from "../../../lib/supabase";

const FeedbackFormsContainer = ({ params }) => {
  const [subjects, setSubjects] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [classroomId, setClassroomId] = useState();
  const [studentId, setStudentId] = useState();

  const formId = params.slug;
  console.log(formId);

  const studentData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchSubjects = async () => {
      if (typeof window === "undefined") return;

      console.log("studentData", studentData);
      const studentId = studentData.student_id;
      setStudentId(studentId);
      console.log("studentId", studentId);
      const { data: formData } = await supabase
        .from("form_table")
        .select("*")
        .eq("form_id", formId);

      console.log("formData", formData[0].form_classroom.toString());

      setClassroomId(formData[0].form_classroom.toString());

      if (!formData.length) {
        return;
      }

      const { data: classroomData } = await supabase
        .from("classroom_table")
        .select("*")
        .eq("classroom_id", formData[0]?.form_classroom);
      const { data: subjectsData } = await supabase
        .from("classroom_subjects")
        .select("*")
        .eq("classroom_id", classroomData[0]?.classroom_id);

      setSubjects(subjectsData || []);
    };

    fetchSubjects();
  }, [formId]);

  const handleNextStep = () => {
    if (currentStep < subjects.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit all responses
      console.log("Submitting all responses...");
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Box>
      {subjects.length > 0 ? (
        <FeedbackForm
          classroomId={classroomId}
          subjectId={subjects[currentStep].id}
          formId={formId}
          onNext={handleNextStep}
          studentId={studentData.student_id}
          onPrevious={handlePreviousStep}
          isLastStep={currentStep === subjects.length - 1}
        />
      ) : (
        <Text>No subjects found for this classroom.</Text>
      )}
    </Box>
  );
};

export default FeedbackFormsContainer;
