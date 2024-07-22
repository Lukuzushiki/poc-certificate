import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Box, ChakraProvider, Flex, Text } from "@chakra-ui/react";
import { Canvas, Rect } from "fabric"; // browser
import FabricCanvas from "./components/FabricCanvas";

function App() {
  return (
    <ChakraProvider>
      <Box>
        <Text fontSize="xl">Certificate POC</Text>

        <Flex>
          <Box>
            <FabricCanvas />
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}

export default App;
