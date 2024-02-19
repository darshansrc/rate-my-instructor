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

function ManageClassrooms() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classrooms
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classroom_table")
          .select("*");

        // Fetch departments for dropdown
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("department_table").select("*");

        if (classroomsError || departmentsError) {
          console.error(
            "Error fetching data:",
            classroomsError || departmentsError
          );
        } else {
          setClassrooms(classroomsData || []);
          setDepartments(departmentsData || []);
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

  const handleClassroomDelete = async (classroomDetails) => {
    console.log("Classroom to be deleted:", classroomDetails);
    try {
      const { data, error } = await supabase
        .from("classroom_table")
        .delete()
        .eq("classroom_id", classroomDetails.classroom_id);
      if (error) {
        console.error("Error deleting classroom:", error.message);
      } else {
        setClassrooms((prevClassrooms) =>
          prevClassrooms.filter(
            (classroom) =>
              classroom.classroom_id !== classroomDetails.classroom_id
          )
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting classroom:", error.message);
    }
  };

  // MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [classroomDetails, setClassroomDetails] = useState({
    classroom_name: "",
    classroom_department: "",
    department_id: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setClassroomDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAdd = async (classroomDetails) => {
    try {
      const { data, error } = await supabase
        .from("classroom_table")
        .upsert([classroomDetails]);
      if (error) {
        console.error("Error adding classroom:", error.message);
      } else {
        setClassrooms((prevClassrooms) => [
          ...prevClassrooms,
          classroomDetails,
        ]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding classroom:", error.message);
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
                Add Classroom <AddIcon margin={2} />
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
                      Classroom ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Classroom Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Classroom Department
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Department ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {classrooms.map((classroom) => (
                    <Tr key={classroom.classroom_id}>
                      <Td>{classroom.classroom_id}</Td>
                      <Td>{classroom.classroom_name}</Td>
                      <Td>{classroom.classroom_department}</Td>
                      <Td>{classroom.department_id}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleClassroomDelete(classroom)}
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
                <ModalHeader>Add Classroom</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Classroom Name</FormLabel>
                    <Input
                      required
                      type="text"
                      name="classroom_name"
                      value={classroomDetails.classroom_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Classroom Department</FormLabel>
                    <Input
                      required
                      type="text"
                      name="classroom_department"
                      value={classroomDetails.classroom_department}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Department</FormLabel>
                    <Select
                      name="department_id"
                      value={classroomDetails.department_id}
                      onChange={handleInputChange}
                      placeholder="Select department"
                    >
                      {departments.map((department) => (
                        <option
                          key={department.department_id}
                          value={department.department_id}
                        >
                          {department.department_name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAdd(classroomDetails)}
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

export default ManageClassrooms;
