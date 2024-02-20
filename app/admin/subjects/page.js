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

function ManageClassroomSubjects() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [newSubject, setNewSubject] = useState({
    subject_name: "",
    subject_code: "",
    handling_instructor: "",
  });
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: classroomsData, error: classroomsError } = await supabase
          .from("classroom_table")
          .select("*");

        const { data: facultiesData, error: facultiesError } = await supabase
          .from("faculty_table")
          .select("*");

        if (classroomsError || facultiesError) {
          console.error(
            "Error fetching data:",
            classroomsError || facultiesError
          );
        } else {
          setClassrooms(classroomsData || []);
          setFaculties(facultiesData || []);
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

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClassroom) return;
      try {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("classroom_subjects")
          .select("*")
          .eq("classroom_id", selectedClassroom);

        if (subjectsError) {
          console.error("Error fetching subjects:", subjectsError.message);
        } else {
          setSubjects(subjectsData || []);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error.message);
      }
    };

    fetchSubjects();
  }, [selectedClassroom]);

  const handleAddSubject = async () => {
    try {
      console.log({ ...newSubject, classroom_id: selectedClassroom });
      const { error } = await supabase
        .from("classroom_subjects")
        .upsert([{ ...newSubject, classroom_id: selectedClassroom }]);

      if (error) {
        console.error("Error adding subject:", error.message);
      } else {
        setSubjects((prevSubjects) => [...prevSubjects, newSubject]);
        setNewSubject({
          subject_name: "",
          subject_code: "",
          handling_instructor: "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error adding subject:", error.message);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const { data, error } = await supabase
        .from("classroom_subjects")
        .delete()
        .eq("subject_id", subjectId);

      if (error) {
        console.error("Error deleting subject:", error.message);
      } else {
        setSubjects((prevSubjects) =>
          prevSubjects.filter((subject) => subject.subject_id !== subjectId)
        );
      }
    } catch (error) {
      console.error("Error deleting subject:", error.message);
    }
  };

  return (
    <>
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
              <Select
                placeholder="Select Classroom"
                onChange={(e) => setSelectedClassroom(e.target.value)}
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
            </ListItem>
            <ListItem>
              {selectedClassroom && (
                <Button onClick={onOpen}>
                  Add Subject <AddIcon margin={2} />
                </Button>
              )}
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
                      Subject Name
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Subject Code
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Handling Instructor
                    </Th>
                    <Th fontWeight="bold" fontSize="lg">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {subjects.map((subject) => (
                    <Tr key={subject.subject_id}>
                      <Td>{subject.subject_name}</Td>
                      <Td>{subject.subject_code}</Td>
                      <Td>{subject.handling_instructor}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() =>
                            handleDeleteSubject(subject.subject_id)
                          }
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
                <ModalHeader>Add Subject</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Subject Name</FormLabel>
                    <Input
                      type="text"
                      value={newSubject.subject_name}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subject_name: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Subject Code</FormLabel>
                    <Input
                      type="text"
                      value={newSubject.subject_code}
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          subject_code: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>Handling Instructor</FormLabel>
                    <Select
                      value={newSubject.handling_instructor}
                      placeholder="Select Instructor"
                      onChange={(e) =>
                        setNewSubject({
                          ...newSubject,
                          handling_instructor: e.target.value,
                        })
                      }
                    >
                      {faculties.map((faculty) => (
                        <option
                          key={faculty.faculty_id}
                          value={faculty.faculty_id}
                          placeholder="Select Instructor"
                        >
                          {faculty.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={handleAddSubject}>
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

export default ManageClassroomSubjects;
