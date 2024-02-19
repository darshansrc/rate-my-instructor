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
  Select,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import supabase from "../../../lib/supabase";
import { useRouter } from "next/navigation";

function ManageForms() {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch forms
        const { data: formsData, error: formsError } = await supabase
          .from("form_table")
          .select("*");

        // Fetch classrooms for dropdown
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classroom_table")
          .select("*");

        if (formsError || classroomsError) {
          console.error("Error fetching data:", formsError || classroomsError);
        } else {
          setForms(formsData || []);
          setClassrooms(classroomsData || []);
          setShouldRefetch(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    if (shouldRefetch) {
      fetchData();
    }
  }, [shouldRefetch]);

  const handleFormDelete = async (formDetails) => {
    console.log("Form to be deleted:", formDetails);
    try {
      const { data, error } = await supabase
        .from("form_table")
        .delete()
        .eq("form_id", formDetails.form_id);
      if (error) {
        console.error("Error deleting form:", error.message);
      } else {
        setForms((prevForms) =>
          prevForms.filter((form) => form.form_id !== formDetails.form_id)
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting form:", error.message);
    }
  };

  // MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formDetails, setFormDetails] = useState({
    form_name: "",
    form_classroom: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAdd = async (formDetails) => {
    try {
      const { data, error } = await supabase
        .from("form_table")
        .upsert([formDetails]);
      if (error) {
        console.error("Error adding form:", error.message);
      } else {
        setForms((prevForms) => [...prevForms, formDetails]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding form:", error.message);
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
              <Button onClick={() => router.push("/admin")}>
                <ChevronLeftIcon />
                Back
              </Button>
            </ListItem>
            <ListItem marginRight={5}>
              <Button onClick={onOpen}>
                Add Form <AddIcon margin={2} />
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
                      Form ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Form Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Classroom ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {forms.map((form) => (
                    <Tr key={form.form_id}>
                      <Td>{form.form_id}</Td>
                      <Td>{form.form_name}</Td>
                      <Td>{form.form_classroom}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleFormDelete(form)}
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
                <ModalHeader>Add Form</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Form Name</FormLabel>
                    <Input
                      required
                      type="text"
                      name="form_name"
                      value={formDetails.form_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Classroom</FormLabel>
                    <Select
                      name="form_classroom"
                      value={formDetails.form_classroom}
                      onChange={handleInputChange}
                      placeholder="Select classroom"
                    >
                      {classrooms.map((classroom) => (
                        <option
                          key={classroom.classroom_id}
                          value={classroom.classroom_id}
                        >
                          {classroom.classroom_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAdd(formDetails)}
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

export default ManageForms;
