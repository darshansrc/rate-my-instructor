"use client";
import supabase from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  VStack,
  Button,
  Container,
  StackDivider,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Heading,
} from "@chakra-ui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      setError(error.message);
      setLoading(false);
      // Handle error appropriately (e.g., show an error message to the user)
      return;
    }

    // Check if the user is a teacher, student, or admin
    const { data: teacherData, error: teacherError } = await supabase
      .from("faculty_table")
      .select("*")
      .eq("email", email)
      .single();

    const { data: studentData, error: studentError } = await supabase
      .from("student_table")
      .select("*")
      .eq("email", email)
      .single();

    const { data: adminData, error: adminError } = await supabase
      .from("admin_table")
      .select("*")
      .eq("email", email)
      .single();

    // Determine the user role and store data in localStorage
    if (teacherData && typeof window !== "undefined") {
      // User is a teacher
      localStorage.setItem("userRole", "faculty");
      localStorage.setItem("userData", JSON.stringify(teacherData));
      setLoading(false);
      router.push("/faculty");
    } else if (studentData) {
      // User is a student
      localStorage.setItem("userRole", "student");
      localStorage.setItem("userData", JSON.stringify(studentData));
      setLoading(false);
      router.push("/student");
    } else if (adminData) {
      // User is an admin
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userData", JSON.stringify(adminData));
      router.push("/admin");
      setLoading(false);
    } else {
      // User not found in any table

      setError("User not found");
      setLoading(false);
      if (typeof window !== "undefined") localStorage.clear();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user =
        (typeof window !== "undefined" && localStorage.getItem("userRole")) ||
        "{}";

      if (user === "admin") {
        router.push("/admin");
      } else if (user === "student") {
        router.push("/student");
      } else if (user.priority === "faculty") {
        router.push("/faculty");
      }
    }
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Container maxWidth="400px">
        <VStack divider={<StackDivider />} spacing={5} align="stretch">
          <Box>
            <FormControl as="form" onSubmit={handleSignIn}>
              <Center>
                <Heading as="h1" size="xl" className="my-6">
                  Rate My Instructor
                </Heading>
              </Center>
              <Heading as="h4" size="l" className="py-4">
                Log In to your Account
              </Heading>
              <FormLabel>Email</FormLabel>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormLabel className="mt-2">Password</FormLabel>
              <Input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <Alert
                  status="error"
                  style={{
                    borderRadius: "10px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <AlertIcon />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full my-6"
                mt={6}
                isLoading={loading}
                colorScheme="teal"
                loadingText={"Logging In"}
              >
                Log In
              </Button>
            </FormControl>
          </Box>
          <Box h="40px" />
        </VStack>
      </Container>
    </div>
  );
}
