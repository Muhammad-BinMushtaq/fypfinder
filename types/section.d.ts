import mongoose from "mongoose";

export interface ISection extends mongoose.Document {
  code: string; // e.g., SE23F-A (used for quick reference)
  name: string; // e.g., Software Engineering - Fall 2023 Section A
  batch: string; // e.g., BSE23F
  semester: number; // e.g., 1, 2, 3, ...
  department?: string; // e.g., Computer Science
  students?: mongoose.Types.ObjectId[]; // Student references
  createdAt?: Date;
  updatedAt?: Date;
}
