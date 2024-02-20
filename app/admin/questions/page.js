"use client";

import { AddIcon, ChevronLeftIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Grid,
  GridItem,
  List,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  TableContainer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Flex, // Add this line to import Flex
  IconButton,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import supabase from "../../../lib/supabase";
import { useRouter } from "next/navigation";

function ManageQuestions() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("question_table")
          .select("*");

        if (error) {
          console.error("Error fetching questions:", error.message);
        } else {
          setQuestions(data || []);
          setShouldRefetch(false);
        }
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      }
    };

    if (shouldRefetch) {
      fetchData();
    }
  }, [shouldRefetch]);

  const handleQuestionDelete = async (questionDetails) => {
    console.log("Question to be deleted:", questionDetails);
    try {
      const { data, error } = await supabase
        .from("question_table")
        .delete()
        .eq("question_id", questionDetails.question_id);
      if (error) {
        console.error("Error deleting question:", error.message);
      } else {
        setQuestions((prevQuestions) =>
          prevQuestions.filter(
            (question) => question.question_id !== questionDetails.question_id
          )
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting question:", error.message);
    }
  };

  // MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [questionDetails, setQuestionDetails] = useState({
    question_name: "",
    question_options: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setQuestionDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAddOption = () => {
    setQuestionDetails((prevDetails) => ({
      ...prevDetails,
      question_options: [...prevDetails.question_options, ""],
    }));
  };

  const handleRemoveOption = (index) => {
    setQuestionDetails((prevDetails) => {
      const updatedOptions = [...prevDetails.question_options];
      updatedOptions.splice(index, 1);
      return {
        ...prevDetails,
        question_options: updatedOptions,
      };
    });
  };

  const handleOptionChange = (index, value) => {
    setQuestionDetails((prevDetails) => {
      const updatedOptions = [...prevDetails.question_options];
      updatedOptions[index] = value;
      return {
        ...prevDetails,
        question_options: updatedOptions,
      };
    });
  };

  const handleAddQuestion = async (questionDetails) => {
    try {
      const { data, error } = await supabase
        .from("question_table")
        .upsert([questionDetails]);
      if (error) {
        console.error("Error adding question:", error.message);
      } else {
        setQuestions((prevQuestions) => [...prevQuestions, questionDetails]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding question:", error.message);
    }
    onClose();
  };

  // ALERT HANDLING
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setTimeout(() => {
      setMessage("");
    }, 3000);
  }, [message]);

  return (
    <>
      {message && (
        <Alert
          status={messageType}
          style={{
            position: "fixed",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "400px",
            borderRadius: "10px",
            backgroundColor: messageType === "success" ? "#48BB78" : "#9B2C2C",
          }}
        >
          <AlertIcon />
          <AlertTitle>{message}</AlertTitle>
        </Alert>
      )}
      <Grid
        templateAreas={{
          base: `"nav nav" "main main"`,
          lg: `"nav nav" "main main"`,
        }}
      >
        <GridItem area="nav" margin={10}>
          <List display="flex" flexDirection="row">
            <ListItem marginRight={5}>
              <Button onClick={() => router.push("/admin/responses")}>
                <ChevronLeftIcon />
                Back
              </Button>
            </ListItem>
            <ListItem marginRight={5}>
              <Button onClick={onOpen}>
                Add Question <AddIcon margin={2} />
              </Button>
            </ListItem>
          </List>
        </GridItem>
        <GridItem area="main" marginRight={10} alignContent="space-evenly">
          <>
            <TableContainer margin={10} maxWidth="90%">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th fontWeight="bold" fontSize="lg">
                      Question ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Question Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Question Options
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {questions.map((question) => (
                    <Tr key={question.question_id}>
                      <Td>{question.question_id}</Td>
                      <Td>{question.question_name}</Td>
                      <Td>
                        {question.question_options.map((option, index) => (
                          <span key={index}>
                            {option}
                            {index !== question.question_options.length - 1 &&
                              ", "}
                          </span>
                        ))}
                      </Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleQuestionDelete(question)}
                        >
                          <DeleteIcon />
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Add Question</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Question Name</FormLabel>
                    <Textarea
                      required
                      name="question_name"
                      value={questionDetails.question_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Question Options</FormLabel>
                    {questionDetails.question_options.map((option, index) => (
                      <Flex key={index} mb={2}>
                        <Input
                          flex="1"
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                        />
                        <IconButton
                          ml={2}
                          colorScheme="red"
                          aria-label="Remove Option"
                          icon={<DeleteIcon />}
                          onClick={() => handleRemoveOption(index)}
                        />
                      </Flex>
                    ))}
                    <Button
                      colorScheme="blue"
                      onClick={handleAddOption}
                      size="sm"
                    >
                      Add Option
                    </Button>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAddQuestion(questionDetails)}
                  >
                    Add
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        </GridItem>
      </Grid>
    </>
  );
}

export default ManageQuestions;
