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

function ManageFaculty() {
  const router = useRouter();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch faculty
        const { data: facultyData, error: facultyError } = await supabase
          .from("faculty_table")
          .select("*");

        // Fetch departments for dropdown
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("department_table").select("*");

        if (facultyError || departmentsError) {
          console.error(
            "Error fetching data:",
            facultyError || departmentsError
          );
        } else {
          setFaculty(facultyData || []);
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

  const handleFacultyDelete = async (facultyDetails) => {
    console.log("Faculty to be deleted:", facultyDetails);
    try {
      const { data, error } = await supabase
        .from("faculty_table")
        .delete()
        .eq("faculty_id", facultyDetails.faculty_id);
      if (error) {
        console.error("Error deleting faculty:", error.message);
      } else {
        setFaculty((prevFaculty) =>
          prevFaculty.filter(
            (faculty) => faculty.faculty_id !== facultyDetails.faculty_id
          )
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting faculty:", error.message);
    }
  };

  // MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [facultyDetails, setFacultyDetails] = useState({
    name: "",
    designation: "",
    department_id: "",
    email: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFacultyDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAdd = async (facultyDetails) => {
    try {
      const { data, error } = await supabase
        .from("faculty_table")
        .upsert([facultyDetails]);
      if (error) {
        console.error("Error adding faculty:", error.message);
      } else {
        setFaculty((prevFaculty) => [...prevFaculty, facultyDetails]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding faculty:", error.message);
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
                Add Faculty <AddIcon margin={2} />
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
                      Faculty ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Designation
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Department ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Email
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {faculty.map((faculty) => (
                    <Tr key={faculty.faculty_id}>
                      <Td>{faculty.faculty_id}</Td>
                      <Td>{faculty.name}</Td>
                      <Td>{faculty.designation}</Td>
                      <Td>{faculty.department_id}</Td>
                      <Td>{faculty.email}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleFacultyDelete(faculty)}
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
                <ModalHeader>Add Faculty</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Name</FormLabel>
                    <Input
                      required
                      type="text"
                      name="name"
                      value={facultyDetails.name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Designation</FormLabel>
                    <Input
                      required
                      type="text"
                      name="designation"
                      value={facultyDetails.designation}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Department</FormLabel>
                    <Select
                      name="department_id"
                      value={facultyDetails.department_id}
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
                    <FormLabel>Email</FormLabel>
                    <Input
                      required
                      type="email"
                      name="email"
                      value={facultyDetails.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAdd(facultyDetails)}
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

export default ManageFaculty;
