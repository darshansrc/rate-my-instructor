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

      const { data: formsData, error: formsError } = await supabase
        .from("form_table")
        .select("*")
        .eq("form_classroom", userData.classroom_id);

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
    <Box>
      <Box
        borderWidth="1px"
        className="flex w-full rounded justify-between items-center p-4   "
      >
        <p className="text-lg font-medium ">Welcome {studentData?.name}</p>

        <Button
          colorScheme="red"
          variant="outline"
          className="mr-4"
          onClick={() => {
            localStorage.clear();
            router.push("/auth/login");
          }}
        >
          Log out
        </Button>
      </Box>
      <Flex flexWrap="wrap">
        {forms.map((form) => (
          <Box
            key={form.form_id}
            p={4}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            m={2}
            className="w-full md:w-1/3"
          >
            <Heading as="h2" size="md" mb={2}>
              {form.form_name}
            </Heading>

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
