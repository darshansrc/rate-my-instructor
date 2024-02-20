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

function ManageStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("student_table")
          .select("*");

        // Fetch departments for dropdown
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("department_table").select("*");

        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classroom_table")
          .select("*");

        if (studentsError || departmentsError) {
          console.error(
            "Error fetching data:",
            studentsError || departmentsError
          );
        } else {
          setStudents(studentsData || []);
          setDepartments(departmentsData || []);
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

  const handleStudentDelete = async (studentDetails) => {
    console.log("Student to be deleted:", studentDetails);
    try {
      const { data, error } = await supabase
        .from("student_table")
        .delete()
        .eq("uid", studentDetails.uid);
      if (error) {
        console.error("Error deleting student:", error.message);
      } else {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.uid !== studentDetails.uid)
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting student:", error.message);
    }
  };

  // MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    email: "",
    department_id: "",
    usn: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setStudentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAdd = async (studentDetails) => {
    try {
      const { data, error } = await supabase
        .from("student_table")
        .upsert([studentDetails]);
      if (error) {
        console.error("Error adding student:", error.message);
      } else {
        setStudents((prevStudents) => [...prevStudents, studentDetails]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding student:", error.message);
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
                Add Student <AddIcon margin={2} />
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
                      ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Email
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Department ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Classroom ID
                    </Th>

                    <Th fontWeight="bold" fontSize="lg">
                      USN
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {students.map((student) => (
                    <Tr key={student.student_id}>
                      <Td>{student.student_id}</Td>
                      <Td>{student.name}</Td>
                      <Td>{student.email}</Td>
                      <Td>{student.department_id}</Td>
                      <Td>{student.classroom_id}</Td>
                      <Td>{student.usn}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleStudentDelete(student)}
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
                <ModalHeader>Add Student</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Name</FormLabel>
                    <Input
                      required
                      type="text"
                      name="name"
                      value={studentDetails.name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      required
                      type="email"
                      name="email"
                      value={studentDetails.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Department</FormLabel>
                    <Select
                      name="department_id"
                      value={studentDetails.department_id}
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
                  <FormControl mb={4}>
                    <FormLabel>Classroom</FormLabel>
                    <Select
                      name="classroom_id"
                      value={studentDetails.classroom_id}
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
                  <FormControl mb={4}>
                    <FormLabel>USN</FormLabel>
                    <Input
                      required
                      type="text"
                      name="usn"
                      value={studentDetails.usn}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAdd(studentDetails)}
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

export default ManageStudents;
