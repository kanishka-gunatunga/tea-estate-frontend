import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { estateService } from "@/services/estateService";
import { employeeService } from "@/services/employeeService";
import { serviceService } from "@/services/serviceService";
import { assignmentService } from "@/services/assignmentService";
import { expenseService } from "@/services/expenseService";
import { eventService } from "@/services/eventService";
import { backupService } from "@/services/backupService";
import { userService } from "@/services/userService";
import { dashboardService } from "@/services/dashboardService";
import { tvService } from "@/services/tvService";

// --- Auth & Profile ---
export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.getMe(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => authService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: any) => authService.changePassword(payload),
  });
}

// --- Estates & Sections ---
export function useEstatesQuery() {
  return useQuery({
    queryKey: ["estates"],
    queryFn: () => estateService.list(),
  });
}

export function useCreateEstateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => estateService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useUpdateEstateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      estateService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useDeleteEstateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => estateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useCreateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ estateId, payload }: { estateId: string; payload: any }) =>
      estateService.createSection(estateId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useUpdateSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      estateId,
      sectionId,
      payload,
    }: {
      estateId: string;
      sectionId: string;
      payload: any;
    }) => estateService.updateSection(estateId, sectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

export function useDeleteSectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ estateId, sectionId }: { estateId: string; sectionId: string }) =>
      estateService.deleteSection(estateId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
    },
  });
}

// --- Employees ---
export function useEmployeesQuery(params?: any) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeeService.list(params),
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => employeeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      employeeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

// --- Services ---
export function useServicesQuery(params?: any) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => serviceService.list(params),
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => serviceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      serviceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

// --- Assignments ---
export function useAssignmentsQuery(params?: any) {
  return useQuery({
    queryKey: ["assignments", params],
    queryFn: () => assignmentService.list(params),
  });
}

export function useCreateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => assignmentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useUpdateAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      assignmentService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useDeleteAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useUpdateAssignmentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      assignmentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useAddWorkerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: string; payload: any }) =>
      assignmentService.addWorker(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useUpdateWorkerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assignmentId,
      employeeId,
      payload,
    }: {
      assignmentId: string;
      employeeId: string;
      payload: any;
    }) => assignmentService.updateWorker(assignmentId, employeeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

export function useRemoveWorkerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, employeeId }: { assignmentId: string; employeeId: string }) =>
      assignmentService.removeWorker(assignmentId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
}

// --- Expenses ---
export function useExpensesQuery(params?: any) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => expenseService.list(params),
  });
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => expenseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      expenseService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

// --- Calendar Events / Reminders ---
export function useEventsQuery(params?: any) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => eventService.list(params),
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => eventService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      eventService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

// --- Users ---
export function useUsersQuery(params?: any) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.list(params),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      userService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// --- Backups ---
export function useBackupsQuery() {
  return useQuery({
    queryKey: ["backups"],
    queryFn: () => backupService.list(),
  });
}

export function useCreateBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: "Manual" | "Auto") => backupService.create(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });
}

export function useDeleteBackupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => backupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });
}

// --- Dashboard & TV ---
export function useDashboardKpisQuery() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: () => dashboardService.getKpis(),
  });
}

export function useDashboardExpenseBreakdownQuery() {
  return useQuery({
    queryKey: ["dashboard", "expense-breakdown"],
    queryFn: () => dashboardService.getExpenseBreakdown(),
  });
}

export function useDashboardMonthlyTrendsQuery() {
  return useQuery({
    queryKey: ["dashboard", "monthly-trends"],
    queryFn: () => dashboardService.getMonthlyTrends(),
  });
}

export function useDashboardSectionHarvestQuery() {
  return useQuery({
    queryKey: ["dashboard", "section-harvest"],
    queryFn: () => dashboardService.getSectionHarvest(),
  });
}

export function useDashboardUpcomingEventsQuery() {
  return useQuery({
    queryKey: ["dashboard", "upcoming-events"],
    queryFn: () => dashboardService.getUpcomingEvents(),
  });
}

export function useTvDashboardQuery(estateId?: string) {
  return useQuery({
    queryKey: ["tv-dashboard", estateId],
    queryFn: () => tvService.getTvDashboard(estateId),
  });
}
