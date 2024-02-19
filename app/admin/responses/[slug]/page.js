"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from "@chakra-ui/react";
import supabase from "../../../../lib/supabase";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

const ViewResponses = ({ params }) => {
  const [responses, setResponses] = useState([]);
  const router = useRouter();

  const formId = params.slug;
  console.log(formId);

  useEffect(() => {
    const fetchResponses = async () => {
      const { data: responsesData, error: responsesError } = await supabase
        .from("response_table")
        .select("*")
        .eq("form_id", formId.toString());

      console.log("responsesData", responsesData);

      if (responsesError) {
        console.error("Error fetching responses:", responsesError.message);
        return;
      }

      setResponses(responsesData || []);
    };

    fetchResponses();
  }, [formId]);

  return (
    <Box p={4}>
      <div className="flex flex-row gap-4 items-center mb-4">
        <Button onClick={() => router.push("/admin/responses")}>
          <ChevronLeftIcon />
          Back
        </Button>
        <Text fontSize="xl">View Responses</Text>
      </div>

      {responses.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Response ID</Th>
              <Th>Form ID</Th>
              <Th>Classroom ID</Th>
              <Th>Subject ID</Th>
              <Th>Student ID</Th>
              <Th>Response</Th>
            </Tr>
          </Thead>
          <Tbody>
            {responses.map((response) => (
              <Tr key={response.response_id}>
                <Td>{response.response_id}</Td>
                <Td>{response.form_id}</Td>
                <Td>{response.classroom_id}</Td>
                <Td>{response.subject_id}</Td>
                <Td>{response.student_id}</Td>
                <Td>{JSON.stringify(response.response)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No responses found.</Text>
      )}
    </Box>
  );
};

export default ViewResponses;
