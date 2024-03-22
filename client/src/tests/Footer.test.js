import React from "react";
import { render } from "@testing-library/react";
import { Footer } from "../components/Footer";

describe("Footer component", () => {
  test("renders footer with correct content", () => {
    const { getByText } = render(<Footer />);
    expect(
      getByText("Authors: Nikolaï Amossé, Martin Ithurbide, Adrien Le Corre, Valentin Leroy, Yusuf Senel, Simon Talbi")
    ).toBeInTheDocument();
    expect(getByText("viscell ©2024")).toBeInTheDocument();
  });
});