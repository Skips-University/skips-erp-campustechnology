import ScienceIcon from "@mui/icons-material/Science";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MemoryIcon from "@mui/icons-material/Memory";

export const menuGroups = [
  {
    id: "virtual-labs",
    title: "Virtual Labs",
    icon: <ScienceIcon />,
    items: [
      { name: "Half subtractor circuit", path: "/halfsubtractorcircuit", icon: <MemoryIcon /> },
      { name: "XNOR gate", path: "/xnorgate", icon: <MemoryIcon /> },
      { name: "XOR gate 2", path: "/xorgate2", icon: <MemoryIcon /> },
      { name: "Full subtractor circuit", path: "/fullsubtractorcircuit", icon: <MemoryIcon /> },
      { name: "Gray to binary converter", path: "/graytobinaryconverter", icon: <MemoryIcon /> },
      { name: "Optical fibre", path: "/opticalfibre", icon: <MemoryIcon /> },
      { name: "Titration", path: "/titration", icon: <MemoryIcon /> },
      { name: "Electrical Machine Lab", path: "/electricalmachinelab", icon: <MemoryIcon /> }
    ]
  },

  {
    id: "games",
    title: "Virtual Lab Games",
    icon: <SportsEsportsIcon />,
    items: [
      { name: "Titration Game", path: "/titrationgame", icon: <SportsEsportsIcon /> },
      { name: "Optical Fibre Game", path: "/opticalfibregame", icon: <SportsEsportsIcon /> },
      { name: "AND Gate Game", path: "/andgategame", icon: <SportsEsportsIcon /> },
      { name: "Pacman", path: "/pacmangame", icon: <SportsEsportsIcon /> },
      { name: "Sudoku", path: "/sudokugame", icon: <SportsEsportsIcon /> },
      { name: "Tower of Hanoi", path: "/towerofhanoi", icon: <SportsEsportsIcon /> }
    ]
  }
];