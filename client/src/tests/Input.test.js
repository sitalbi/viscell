import React from "react";
import { render } from "@testing-library/react";
import { Input } from "../components/Input";

describe("Input component", () => {
    test("renders footer with correct content", () => {
        const { getByText } = render(<Input />);
        expect(getByText("Input")).toBeInTheDocument();
    });
});