import { PartialType } from "@nestjs/swagger";
import { createCourseDto } from "./createCourse.dto";

export class UpdateCourseDto extends PartialType(createCourseDto) {}