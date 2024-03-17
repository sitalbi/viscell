import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { About } from "../components/About";

describe("About component", () => {
  it("renders with default French version content", () => {
    const { getByText } = render(<About />);
    expect(getByText("Superviseur :")).toBeInTheDocument();
    expect(getByText("Contexte")).toBeInTheDocument();
    expect(getByText("Objectifs")).toBeInTheDocument();
    expect(getByText("Fonctionnalités")).toBeInTheDocument();
  });

  it("toggles between French and English content when the flag is clicked", () => {
    const { getByAltText, getByText } = render(<About />);
    fireEvent.click(getByAltText("English Flag"));
    expect(getByText("Imagined by :")).toBeInTheDocument();
    expect(getByText("Context")).toBeInTheDocument();
    expect(getByText("Objectives")).toBeInTheDocument();
    expect(getByText("Features")).toBeInTheDocument();
  });

  it("toggles between English and French content when the flag is clicked twice", () => {
    const { getByAltText, getByText } = render(<About />);
    fireEvent.click(getByAltText("English Flag"));
    fireEvent.click(getByAltText("English Flag"));
    expect(getByText("Superviseur :")).toBeInTheDocument();
    expect(getByText("Contexte")).toBeInTheDocument();
    expect(getByText("Objectifs")).toBeInTheDocument();
    expect(getByText("Fonctionnalités")).toBeInTheDocument();
  });
});
