import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("shows the company attribution in the header", () => {
    render(<App />);
    expect(screen.getByText("杭州亿序科技有限公司")).toBeInTheDocument();
  });

  it("starts the assessment and prevents advancing without an answer", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /开始战略诊断/ }));
    expect(screen.getByRole("heading", { name: /企业规模与存量机制负担/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /下一题/ })).toBeDisabled();
  });

  it("selects an option and advances to the next question", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /开始战略诊断/ }));
    fireEvent.click(screen.getByRole("radio", { name: /50 人以下/ }));
    const next = screen.getByRole("button", { name: /下一题/ });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(screen.getByRole("heading", { name: /核心流程与 IT 系统/ })).toBeInTheDocument();
  });
});
