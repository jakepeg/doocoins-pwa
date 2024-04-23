import { extendBaseTheme } from "@chakra-ui/react";
import chakraTheme from "@chakra-ui/theme";

const { Button } = chakraTheme.components;

const theme = extendBaseTheme({
  components: {
    Button
  },
});

export default theme;
