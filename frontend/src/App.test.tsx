import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders asset management system title", () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /Asset Management System/i });
  expect(titleElement).toBeInTheDocument();
});
