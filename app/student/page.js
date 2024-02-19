"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import supabase from "../../lib/supabase";
import { useRouter } from "next/navigation";

const ManageForms = () => {
  const [forms, setForms] = useState([]);
  const router = useRouter();
  const [studentData, setStudentData] = useState();

  useEffect(() => {
    const fetchForms = async () => {
      if (typeof window === "undefined") return;
      const userDataString = localStorage.getItem("userData");
      setStudentData(JSON.parse(userDataString));
      if (!userDataString) return; // Handle case where userData is not in localStorage
      const userData = JSON.parse(userDataString);
      console.log("UserData localstorage", userData.classroom_id);

      const { data: formsData, error: formsError } = await supabase
        .from("form_table")
        .select("*")
        .eq("form_classroom", userData.classroom_id);

      console.log("formsData", formsData);

      if (formsError) {
        console.error("Error fetching forms data:", formsError.message);
        return;
      }

      setForms(formsData || []);
    };

    fetchForms();
  }, []);

  const handleFormClick = (formId) => {
    router.push(`/student/${formId}`);
  };

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Welcome {studentData?.name}
      </Heading>
      <Flex flexWrap="wrap">
        {forms.map((form) => (
          <Box
            key={form.form_id}
            p={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            m={2}
          >
            <Heading as="h2" size="md" mb={2}>
              {form.form_name}
            </Heading>
            <Text mb={2}>Classroom ID: {form.form_classroom}</Text>
            <Button
              colorScheme="blue"
              onClick={() => handleFormClick(form.form_id)}
            >
              Fill Form
            </Button>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default ManageForms;
