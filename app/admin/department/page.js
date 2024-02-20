"use client";

// Import necessary Chakra UI and React components
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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import supabase from "../../../lib/supabase";
import { useRouter } from "next/navigation";

function ManageDepartments() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);

  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from("department_table")
          .select("*");

        if (error) {
          console.error("Error fetching departments:", error.message);
        } else {
          setDepartments(data || []);
          setShouldRefetch(false); // Reset the refetch flag
        }
      } catch (error) {
        console.error("Error fetching departments:", error.message);
      }
    };

    if (shouldRefetch) {
      fetchDepartments();
    }
  }, [shouldRefetch]);

  const handleDepartmentDelete = async (departmentDetails) => {
    console.log("Department to be deleted:", departmentDetails);
    try {
      const { data, error } = await supabase
        .from("department_table")
        .delete()
        .eq("department_id", departmentDetails.department_id);
      if (error) {
        console.error("Error deleting department:", error.message);
      } else {
        setDepartments((prevDepartments) =>
          prevDepartments.filter(
            (department) =>
              department.department_id !== departmentDetails.department_id
          )
        );
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error deleting department:", error.message);
    }
  };

  //MODAL HANDLING
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [departmentDetails, setDepartmentDetails] = useState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setDepartmentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleAdd = async (departmentDetails) => {
    try {
      const { data, error } = await supabase
        .from("department_table")
        .upsert([departmentDetails]);
      if (error) {
        console.error("Error adding department:", error.message);
      } else {
        setDepartments((prevDepartments) => [
          ...prevDepartments,
          departmentDetails,
        ]);
        setShouldRefetch(true);
      }
    } catch (error) {
      console.error("Error adding department:", error.message);
    }
    onClose();
  };

  //ALERT HANDLING
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
                Add Department <AddIcon margin={2} />
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
                      Department ID
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Department Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {departments.map((department) => (
                    <Tr key={department.department_id}>
                      <Td>{department.department_id}</Td>
                      <Td>{department.department_name}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDepartmentDelete(department)}
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
                <ModalHeader>Add Department</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Department Name</FormLabel>
                    <Input
                      required
                      type="text"
                      name="department_name"
                      value={departmentDetails?.department_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => handleAdd(departmentDetails)}
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

export default ManageDepartments;
