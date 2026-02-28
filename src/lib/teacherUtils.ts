/**
 * Utility functions for teacher access control based on their assignments
 */

import { api } from './api';

export interface TeacherAssignments {
  is_class_teacher: boolean;
  assigned_class_ids: number[];
  assigned_subject_ids: number[];
  teaching_assignments: Array<{
    class_id: number;
    class_name: string;
    subject_id: number;
    subject_name: string;
  }>;
  class_teacher_for: Array<{
    id: number;
    name: string;
  }>;
}

/**
 * Get detailed teaching assignments for current teacher
 */
export const getTeacherAssignments = async (): Promise<TeacherAssignments | null> => {
  try {
    const assignments = await api.users.myTeachingAssignments();
    return assignments;
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    return null;
  }
};

/**
 * Check if a teacher is a class teacher (teaches an entire class)
 */
export const isClassTeacher = async (): Promise<boolean> => {
  try {
    const assignments = await getTeacherAssignments();
    return assignments?.is_class_teacher || false;
  } catch (error) {
    console.error('Error checking if teacher is class teacher:', error);
    return false;
  }
};

/**
 * Get classes where teacher is the class teacher
 */
export const getClassTeacherFor = async (): Promise<Array<{ id: number; name: string }>> => {
  try {
    const assignments = await getTeacherAssignments();
    return assignments?.class_teacher_for || [];
  } catch (error) {
    console.error('Error fetching class teacher assignments:', error);
    return [];
  }
};

/**
 * Get all classes the teacher teaches (either as class teacher or subject teacher)
 */
export const getTeacherClasses = async (): Promise<number[]> => {
  try {
    const assignments = await getTeacherAssignments();
    return assignments?.assigned_class_ids || [];
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return [];
  }
};

/**
 * Get subjects the teacher teaches across all classes
 */
export const getTeacherSubjects = async (): Promise<number[]> => {
  try {
    const assignments = await getTeacherAssignments();
    return assignments?.assigned_subject_ids || [];
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    return [];
  }
};

/**
 * Get teaching assignments grouped by class
 */
export const getTeachingAssignmentsByClass = async (): Promise<Record<number, Array<{ subject_id: number; subject_name: string }>>> => {
  try {
    const assignments = await getTeacherAssignments();
    if (!assignments) return {};

    const grouped: Record<number, Array<{ subject_id: number; subject_name: string }>> = {};

    assignments.teaching_assignments.forEach((assignment) => {
      if (!grouped[assignment.class_id]) {
        grouped[assignment.class_id] = [];
      }
      grouped[assignment.class_id].push({
        subject_id: assignment.subject_id,
        subject_name: assignment.subject_name,
      });
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping teaching assignments:', error);
    return {};
  }
};

/**
 * Filter pages/features available to teacher based on their role
 */
export const getTeacherAvailableFeatures = async (): Promise<{
  can_view_attendance: boolean;
  can_view_results: boolean;
  can_view_timetable: boolean;
  can_view_order_of_merit: boolean;
}> => {
  try {
    const isClassTeach = await isClassTeacher();

    // All teachers can view results and timetable for their classes/subjects
    // Only class teachers can view attendance and order of merit
    return {
      can_view_attendance: isClassTeach,
      can_view_results: true,
      can_view_timetable: true,
      can_view_order_of_merit: isClassTeach,
    };
  } catch (error) {
    console.error('Error determining available features:', error);
    return {
      can_view_attendance: false,
      can_view_results: false,
      can_view_timetable: false,
      can_view_order_of_merit: false,
    };
  }
};
