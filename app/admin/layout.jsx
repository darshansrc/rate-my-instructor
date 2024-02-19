"use client";
import { Box, Button, Divider, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;
  console.log(pathname);

  return (
    <Box display="flex">
      {/* Sidebar */}
      <Box
        width="250px"
        p="4"
        className="h-screen"
        style={{ borderRight: "1px solid #444" }}
      >
        <nav>
          <Heading as="h1" size="xl" className="my-10">
            Rate My Instructor
          </Heading>
          <Divider
            orientation="vertical"
            borderColor="gray.300"
            height="100%"
            mx="2"
          />
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/classrooms"
            textDecoration="none"
            textAlign="left"
            backgroundColor={isActive("/admin/classrooms") ? "blue.500" : ""}
            fontWeight={isActive("/admin/classrooms") ? "bold" : "normal"}
          >
            Manage Classrooms
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/subjects"
            textDecoration="none"
            textAlign="left"
            backgroundColor={isActive("/admin/subjects") ? "blue.500" : ""}
            fontWeight={isActive("/admin/subjects") ? "bold" : "normal"}
          >
            Manage subjects
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/questions"
            textDecoration="none"
            textAlign="left"
            backgroundColor={isActive("/admin/questions") ? "blue.500" : ""}
            fontWeight={isActive("/admin/questions") ? "bold" : "normal"}
          >
            Manage Questions
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/faculty"
            textAlign="left"
            textDecoration="none"
            backgroundColor={isActive("/admin/faculty") ? "blue.500" : ""}
            fontWeight={isActive("/admin/faculty") ? "bold" : "normal"}
          >
            Manage Faculty
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/student"
            textAlign="left"
            textDecoration="none"
            backgroundColor={isActive("/admin/student") ? "blue.500" : ""}
            fontWeight={isActive("/admin/student") ? "bold" : "normal"}
          >
            Manage Students
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/responses"
            textAlign="left"
            textDecoration="none"
            backgroundColor={isActive("/admin/responses") ? "blue.500" : ""}
            fontWeight={isActive("/admin/responses") ? "bold" : "normal"}
          >
            Manage Responses
          </Button>
          <Button
            className="w-full my-2"
            as={NextLink}
            href="/admin/department"
            textDecoration="none"
            textAlign="left"
            backgroundColor={isActive("/admin/department") ? "blue.500" : ""}
            fontWeight={isActive("/admin/department") ? "bold" : "normal"}
          >
            Manage Departments
          </Button>

          <Button
            className="w-full my-2"
            onClick={() => {
              localStorage.clear();
              router.push("/auth/login");
            }}
            textDecoration="none"
            textAlign="left"
          >
            Logout
          </Button>
        </nav>
      </Box>

      {/* Main content */}
      <Box flex="1" p="4">
        {/* Navbar */}
        <Box mb="4">{/* Add your navbar content here */}</Box>

        {/* Main content area */}
        <Box>{children}</Box>
      </Box>
    </Box>
  );
}
