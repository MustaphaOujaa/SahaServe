import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useCreateUserMutation,
  useCreateTableMutation,
  useCreateCategoryMutation,
  useCreateDishMutation,
  useCreateTagMutation,
  useDeleteCategoryMutation,
  useDeleteDishMutation,
  useDeleteTagMutation,
  useDeleteUserMutation,
  useDeleteTableMutation,
  useGetCategoriesQuery,
  useGetDishesQuery,
  useGetOrderQuery,
  useGetOrdersQuery,
  useGetReservationsQuery,
  useGetRolesAndPermissionsQuery,
  useGetTablesQuery,
  useGetTagsQuery,
  useGetUsersQuery,
  useAnalyzeReviewsQuery,
  useUpdateCategoryMutation,
  useUpdateDishMutation,
  useUpdateOrderStatusMutation,
  useUpdateReservationMutation,
  useUpdateTagMutation,
  useUpdateTableMutation,
  useUpdateUserRoleMutation,
  useDeleteReservationMutation,
} from "../redux/api/apiSlice";
import { ButtonSpinner, LoadingOverlay } from "../Components/UI/Loading";
import ConfirmDialog from "../Components/UI/ConfirmDialog";
import { downloadAdminReport } from "../utils/api";

const sections = (t) => [
  { id: "overview", label: t('dashboard.overview'), icon: "fa-border-all" },
  { id: "users", label: t('dashboard.users'), icon: "fa-users" },
  { id: "orders", label: t('dashboard.orders'), icon: "fa-receipt" },
  { id: "reservations", label: t('dashboard.reservations'), icon: "fa-calendar-check" },
  { id: "tables", label: t('dashboard.tables'), icon: "fa-chair" },
  { id: "menu", label: t('dashboard.menu'), icon: "fa-utensils" },
  { id: "ai-services", label: t('dashboard.aiServices'), icon: "fa-brain" },
  { id: "roles", label: t('dashboard.roles'), icon: "fa-shield-alt" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const sameDay = (value, date) => {
  if (!date) return true;
  if (!value) return false;
  return value.slice(0, 10) === date;
};

const orderStatuses = ["pending", "confirmed", "preparing", "prepared", "delivered", "cancelled"];
const reservationStatuses = ["pending", "confirmed", "cancelled", "completed", "no_show"];

const getPermissionTone = (permission) => {
  if (permission.includes("manage-users") || permission.includes("manage-roles")) {
    return "border-[#e8c5bd] bg-[#f7ece9] text-[#9b3f2f]";
  }

  if (permission.includes("manage-orders") || permission.includes("manage-reservation") || permission.includes("manage-tables")) {
    return "border-[#f0d9a5] bg-[#fff7e5] text-[#9a6813]";
  }

  if (permission.includes("manage-dishes") || permission.includes("manage-dishs") || permission.includes("manage-categories") || permission.includes("manage-tags")) {
    return "border-[#d8c8ea] bg-[#f2ecfa] text-[#6f4a9b]";
  }

  if (permission.includes("make-")) {
    return "border-[#bee2c8] bg-[#edf8ef] text-[#287a3e]";
  }

  return "border-[#e8dfd2] bg-[#f8f6f1] text-[#8a7662]";
};

const statusStyles = {
  pending: "bg-[#fff7e5] text-[#9a6813] border-[#f0d9a5]",
  preparing: "bg-[#f5e6c8] text-[#6b4b25] border-[#e4c88d]",
  confirmed: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  prepared: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  available: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  hidden: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
  positive: "bg-[#edf8ef] text-[#287a3e] border-[#bee2c8]",
  negative: "bg-[#f7ece9] text-[#9b3f2f] border-[#e8c5bd]",
  neutral: "bg-[#f6f0e4] text-[#6b4b25] border-[#e6d6bc]",
  "N/A": "bg-[#f8f6f1] text-[#8a7662] border-[#e8dfd2]",
};

const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(image)) {
    return image;
  }

  const cleanPath = image.replace(/^\/+/, "");
  if (/^(users|categories|dishes)\//i.test(cleanPath)) {
    return `${apiOrigin}/storage/${cleanPath}`;
  }

  return `${apiOrigin}/${cleanPath}`;
};

const getDishImages = (dish) => (dish?.images || []).map((image) => image.url).filter(Boolean);

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const compressImageFile = (file, maxSize = MAX_IMAGE_SIZE) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read the image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Failed to load the image."));
      image.onload = () => {
        const maxDimension = 1400;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const buildBlob = (quality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress the image."));
                return;
              }

              if (blob.size <= maxSize || quality <= 0.55) {
                if (blob.size > maxSize) {
                  reject(new Error("Image must be 2 MB or less after compression."));
                  return;
                }

                resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
                return;
              }

              buildBlob(quality - 0.1);
            },
            "image/jpeg",
            quality
          );
        };

        buildBlob(file.size > maxSize ? 0.82 : 0.9);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function CategoryImage({ image, name, className = "h-12 w-12" }) {
  const [hasError, setHasError] = useState(false);
  const src = getImageUrl(image);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`${className} flex shrink-0 items-center justify-center rounded-[10px] border border-beige bg-gold-pale text-gold`}>
        <i className="fas fa-image text-[0.9rem]"></i>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Category"}
      onError={() => setHasError(true)}
      className={`${className} shrink-0 rounded-[10px] border border-beige object-cover`}
    />
  );
}

function ImageStrip({ images = [], name, size = "h-16 w-16" }) {
  const visibleImages = images.length ? images.slice(0, 5) : [""];

  return (
    <div className="flex flex-wrap gap-2">
      {visibleImages.map((image, index) => (
        <div key={`${image}-${index}`} className="relative">
          <CategoryImage image={image} name={name} className={size} />
          {images.length > 1 && image && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brown-dark px-1 text-[0.62rem] font-bold text-white">
              {index + 1}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-semibold capitalize ${statusStyles[value] || statusStyles.pending}`}>
      {value}
    </span>
  );
}

function SectionHeader({ eyebrow, title, action, onAction }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-beige pb-4">
      <div>
        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</span>
        <h2 className="font-['Cormorant_Garamond'] text-[1.75rem] font-bold leading-tight text-brown-dark">{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction} className="btn btn-outline !px-4 !py-2">
          <i className="fas fa-plus text-[0.72rem]"></i>
          {action}
        </button>
      )}
    </div>
  );
}

function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-[16px] border border-[rgba(200,146,42,0.14)] bg-white shadow-custom ${className}`}>
      {children}
    </div>
  );
}

function SeverityMeter({ score }) {
  const width = `${Math.min(Math.max(score * 10, 0), 100)}%`;
  const color = score >= 7 ? "bg-[#b84a34]" : score >= 4 ? "bg-gold" : "bg-[#3b8a4d]";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[0.78rem] font-semibold text-text-mid">
        <span>Severity score</span>
        <span className="text-brown-dark">{score.toFixed(1)}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-beige">
        <div className={`h-full rounded-full ${color}`} style={{ width }}></div>
      </div>
    </div>
  );
}

function AspectGrid({ aspects }) {
  const safeAspects = aspects || {};

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {Object.entries(safeAspects).map(([aspect, value]) => (
        <div key={aspect} className="rounded-[12px] border border-beige bg-white p-3">
          <div className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-text-mid">{aspect}</div>
          <StatusBadge value={value} />
        </div>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-b border-beige bg-cream/70">
            {columns.map((column) => (
              <th key={column} className="px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-beige/70 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4 text-[0.86rem] text-text-mid">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DashboardPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");
  const [usersPage, setUsersPage] = useState(1);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showCreateTableForm, setShowCreateTableForm] = useState(false);
  const [showCreateDishForm, setShowCreateDishForm] = useState(false);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [showCreateTagForm, setShowCreateTagForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [dishToEdit, setDishToEdit] = useState(null);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [tagToEdit, setTagToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [exportReport, setExportReport] = useState("orders");
  const [exportDate, setExportDate] = useState(todayIso());
  const [newTable, setNewTable] = useState({
    name: "",
    number: "",
    capacity: "",
    is_available: true,
  });
  const [newDish, setNewDish] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    is_available: true,
    imageFiles: [],
    imagePreviews: [],
  });
  const [dishEditForm, setDishEditForm] = useState({
    name: "",
    category_id: "",
    description: "",
    price: "",
    is_available: true,
    imageFiles: [],
    imagePreviews: [],
  });
  const [categoryEditForm, setCategoryEditForm] = useState({
    name: "",
    description: "",
    imageFile: null,
    imagePreview: "",
  });
  const [tagEditForm, setTagEditForm] = useState({ name: "" });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageFile: null,
    imagePreview: "",
  });
  const [newTag, setNewTag] = useState({ name: "" });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    adress: "",
    role: "client",
  });
  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useGetUsersQuery(usersPage);
  const {
    data: rolesResponse,
    isLoading: isRolesLoading,
    isFetching: isRolesFetching,
    isError: isRolesError,
  } = useGetRolesAndPermissionsQuery();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const {
    data: adminOrders = [],
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    isError: isOrdersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery();
  const {
    data: selectedOrder,
    isLoading: isOrderDetailsLoading,
  } = useGetOrderQuery(selectedOrderId, { skip: !selectedOrderId });
  const [updateOrderStatus, { isLoading: isUpdatingOrderStatus }] = useUpdateOrderStatusMutation();
  const {
    data: adminReservations = [],
    isLoading: isReservationsLoading,
    isFetching: isReservationsFetching,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useGetReservationsQuery();
  const [updateReservation, { isLoading: isUpdatingReservation }] = useUpdateReservationMutation();
  const [deleteReservation, { isLoading: isDeletingReservation }] = useDeleteReservationMutation();
  const {
    data: adminTables = [],
    isLoading: isTablesLoading,
    isFetching: isTablesFetching,
    isError: isTablesError,
    refetch: refetchTables,
  } = useGetTablesQuery();
  const [createTable, { isLoading: isCreatingTable }] = useCreateTableMutation();
  const [updateTable, { isLoading: isUpdatingTable }] = useUpdateTableMutation();
  const [deleteTable, { isLoading: isDeletingTable }] = useDeleteTableMutation();
  const {
    data: adminDishes = [],
    isLoading: isDishesLoading,
    isFetching: isDishesFetching,
    isError: isDishesError,
    refetch: refetchDishes,
  } = useGetDishesQuery();
  const {
    data: adminCategories = [],
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();
  const {
    data: tagsResponse,
    isLoading: isTagsLoading,
    isFetching: isTagsFetching,
    isError: isTagsError,
    refetch: refetchTags,
  } = useGetTagsQuery();
  const [createDish, { isLoading: isCreatingDish }] = useCreateDishMutation();
  const [updateDish, { isLoading: isUpdatingDish }] = useUpdateDishMutation();
  const [deleteDish, { isLoading: isDeletingDish }] = useDeleteDishMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation();
  const [createTag, { isLoading: isCreatingTag }] = useCreateTagMutation();
  const [updateTag, { isLoading: isUpdatingTag }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeletingTag }] = useDeleteTagMutation();
  const shouldLoadReviewAnalysis = activeSection === "overview" || activeSection === "ai-services" || exportReport === "review-analysis";
  const {
    data: reviewAnalysisResponse,
    isLoading: isReviewAnalysisLoading,
    isFetching: isReviewAnalysisFetching,
    isError: isReviewAnalysisError,
    error: reviewAnalysisError,
    refetch: refetchReviewAnalysis,
  } = useAnalyzeReviewsQuery({ date: exportReport === "review-analysis" ? exportDate : undefined }, { skip: !shouldLoadReviewAnalysis });

  const adminUsers = usersResponse?.data || [];
  const paginationLinks = usersResponse?.links || [];
  const availableRoles = rolesResponse?.roles || [];
  const isUsersBusy = isUsersLoading || isUsersFetching;
  const isOrdersBusy = isOrdersLoading || isOrdersFetching;
  const isReservationsBusy = isReservationsLoading || isReservationsFetching;
  const isTablesBusy = isTablesLoading || isTablesFetching;
  const isRolesBusy = isRolesLoading || isRolesFetching;
  const adminTags = tagsResponse?.data || [];
  const isMenuBusy = isDishesLoading || isDishesFetching || isCategoriesLoading || isCategoriesFetching || isTagsLoading || isTagsFetching;
  const reviewAnalysis = reviewAnalysisResponse?.analysis;
  const analyzedReviews = reviewAnalysisResponse?.reviews || [];
  const isReviewAnalysisBusy = isReviewAnalysisLoading || isReviewAnalysisFetching;
  const pendingOrdersCount = adminOrders.filter((order) => order.status === "pending").length;
  const todayReservationsCount = adminReservations.filter((reservation) => sameDay(reservation.reservation_date, todayIso())).length;
  const unavailableTablesCount = adminTables.filter((table) => !table.is_available).length;
  const dashboardMetrics = [
    {
      label: t('dashboard.totalRevenue'),
      value: formatMoney(adminOrders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)),
      icon: "fa-chart-line",
      detail: `${adminOrders.length} ${adminOrders.length === 1 ? t('orders.order') : t('dashboard.orders')} ${t('common.loaded')}`,
    },
    {
      label: t('dashboard.orders'),
      value: String(adminOrders.length),
      icon: "fa-receipt",
      detail: `${pendingOrdersCount} ${t('dashboard.pendingOrders')}`,
    },
    {
      label: t('dashboard.reservations'),
      value: String(adminReservations.length),
      icon: "fa-calendar-check",
      detail: `${todayReservationsCount} ${t('common.today')}`,
    },
    {
      label: t('dashboard.tables'),
      value: `${adminTables.filter((table) => table.is_available).length}/${adminTables.length}`,
      icon: "fa-chair",
      detail: `${unavailableTablesCount} ${t('common.unavailable')}`,
    },
  ];

  function formatMoney(value) {
    const number = Number(value || 0);
    return `${number.toFixed(2)} DH`;
  }

  const formatOrderItems = (items = []) => {
    if (!items.length) {
      return t('orders.noItems');
    }

    return items
      .map((item) => `${item.dish?.name || t('dishes.dish')} x${item.quantity}`)
      .join(", ");
  };

  const formatDate = (date) => {
    if (!date) {
      return t('common.N/A');
    }

    return new Date(date).toLocaleDateString();
  };

  const formatTimeRange = (reservation) => {
    return `${reservation.start_time || "N/A"} - ${reservation.end_time || "N/A"}`;
  };

  const orderRows = useMemo(
    () =>
      adminOrders.slice(0, activeSection === "overview" ? 5 : adminOrders.length).map((order) => [
        <strong className="text-brown-dark">#{order.id}</strong>,
        order.user?.name || "Unknown customer",
        formatOrderItems(order.items),
        <strong className="text-brown-dark">{formatMoney(order.total_price)}</strong>,
        <StatusBadge value={order.status} />,
        activeSection !== "overview" ? (
          <div className="flex flex-wrap gap-2">
            <select
              value={order.status}
              disabled={isUpdatingOrderStatus}
              onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
              className="rounded-full border border-beige bg-gold-pale px-3 py-1 text-[0.72rem] font-semibold capitalize text-gold outline-none focus:border-gold"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSelectedOrderId(order.id)}
              className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold"
            >
              Details
            </button>
          </div>
        ) : null,
      ]),
    [activeSection, adminOrders, isUpdatingOrderStatus]
  );

  const handleExportPdf = async () => {
    try {
      await downloadAdminReport(exportReport, exportDate);
    } catch (err) {
      toast.error(err?.response?.data?.message || t('dashboard.exportPdfError'));
    }
  };

  const visibleSections = activeSection === "overview" ? sections(t).slice(1).map((section) => section.id) : [activeSection];

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      await createUser(newUser).unwrap();
      toast.success("User created.");
      setShowCreateUserForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone_number: "",
        adress: "",
        role: "client",
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user.");
    }
  };

  const handleCreateTable = async (event) => {
    event.preventDefault();

    try {
      await createTable({
        ...newTable,
        number: Number(newTable.number),
        capacity: Number(newTable.capacity),
      }).unwrap();
      toast.success("Table created.");
      setShowCreateTableForm(false);
      setNewTable({
        name: "",
        number: "",
        capacity: "",
        is_available: true,
      });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create table.");
    }
  };

  const handleCreateDish = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", newDish.name);
      formData.append("category_id", Number(newDish.category_id));
      formData.append("description", newDish.description || "");
      formData.append("price", Number(newDish.price));
      formData.append("is_available", newDish.is_available ? "1" : "0");
      newDish.imageFiles.forEach((imageFile) => formData.append("images[]", imageFile));

      await createDish(formData).unwrap();
      toast.success("Dish created.");
      setShowCreateDishForm(false);
      setNewDish({ name: "", category_id: "", description: "", price: "", is_available: true, imageFiles: [], imagePreviews: [] });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create dish.");
    }
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", newCategory.name);
      formData.append("description", newCategory.description || "");
      if (newCategory.imageFile) {
        formData.append("image", newCategory.imageFile);
      }

      await createCategory(formData).unwrap();
      toast.success("Category created.");
      setShowCreateCategoryForm(false);
      setNewCategory({ name: "", description: "", imageFile: null, imagePreview: "" });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create category.");
    }
  };

  const handleCreateTag = async (event) => {
    event.preventDefault();

    try {
      await createTag(newTag).unwrap();
      toast.success("Tag created.");
      setShowCreateTagForm(false);
      setNewTag({ name: "" });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create tag.");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole({ userId, role }).unwrap();
      toast.success("User role updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update user role.");
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast.success("Order status updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update order status.");
    }
  };

  const handleReservationUpdate = async (reservationId, data) => {
    try {
      await updateReservation({ reservationId, data }).unwrap();
      toast.success("Reservation updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update reservation.");
    }
  };

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) {
      return;
    }

    try {
      await deleteReservation(reservationToDelete.id).unwrap();
      toast.success("Reservation deleted.");
      setReservationToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete reservation.");
    }
  };

  const handleTableUpdate = async (tableId, data) => {
    try {
      await updateTable({ tableId, data }).unwrap();
      toast.success("Table updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update table.");
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) {
      return;
    }

    try {
      await deleteTable(tableToDelete.id).unwrap();
      toast.success("Table deleted.");
      setTableToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete table.");
    }
  };

  const handleDishUpdate = async (dishId, data) => {
    try {
      await updateDish({ dishId, data }).unwrap();
      toast.success("Dish updated.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update dish.");
    }
  };

  const openDishEditForm = (dish) => {
    setDishToEdit(dish);
    setDishEditForm({
      name: dish.name || "",
      category_id: dish.category_id || "",
      description: dish.description || "",
      price: dish.price || "",
      is_available: Boolean(dish.is_available),
      imageFiles: [],
      imagePreviews: getDishImages(dish),
    });
  };

  const openCategoryEditForm = (category) => {
    setCategoryToEdit(category);
    setCategoryEditForm({
      name: category.name || "",
      description: category.description || "",
      imageFile: null,
      imagePreview: category.image || "",
    });
  };

  const openTagEditForm = (tag) => {
    setTagToEdit(tag);
    setTagEditForm({ name: tag.name || "" });
  };

  const handleDishEditSubmit = async (event) => {
    event.preventDefault();

    if (!dishToEdit) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", dishEditForm.name);
      formData.append("category_id", Number(dishEditForm.category_id));
      formData.append("description", dishEditForm.description || "");
      formData.append("price", Number(dishEditForm.price));
      formData.append("is_available", dishEditForm.is_available ? "1" : "0");
      dishEditForm.imageFiles.forEach((imageFile) => formData.append("images[]", imageFile));

      await updateDish({
        dishId: dishToEdit.id,
        data: formData,
      }).unwrap();
      toast.success("Dish updated.");
      setDishToEdit(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update dish.");
    }
  };

  const handleDishAvailabilityChange = async (dish) => {
    try {
      await updateDish({
        dishId: dish.id,
        data: { is_available: !dish.is_available },
      }).unwrap();
      toast.success(dish.is_available ? "Dish hidden." : "Dish is available.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to change dish status.");
    }
  };

  const handleCategoryEditSubmit = async (event) => {
    event.preventDefault();

    if (!categoryToEdit) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", categoryEditForm.name);
      formData.append("description", categoryEditForm.description || "");
      if (categoryEditForm.imageFile) {
        formData.append("image", categoryEditForm.imageFile);
      }

      await updateCategory({
        categoryId: categoryToEdit.id,
        data: formData,
      }).unwrap();
      toast.success("Category updated.");
      setCategoryToEdit(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update category.");
    }
  };

  const handleCategoryImageSelect = async (file, setForm) => {
    if (!file) {
      return;
    }

    try {
      const compressedFile = await compressImageFile(file);
      setForm((category) => ({
        ...category,
        imageFile: compressedFile,
        imagePreview: URL.createObjectURL(compressedFile),
      }));
      toast.success("Image compressed and ready.");
    } catch (error) {
      toast.error(error.message || "Failed to prepare image.");
    }
  };

  const handleDishImagesSelect = async (files, setForm) => {
    const selectedFiles = Array.from(files || []).slice(0, 5);

    if (selectedFiles.length === 0) {
      return;
    }

    try {
      const compressedFiles = await Promise.all(selectedFiles.map((file) => compressImageFile(file)));
      setForm((dish) => ({
        ...dish,
        imageFiles: compressedFiles,
        imagePreviews: compressedFiles.map((file) => URL.createObjectURL(file)),
      }));
      if (files?.length > 5) {
        toast.error("Only the first 5 images were selected.");
      }
      toast.success(`${compressedFiles.length} image${compressedFiles.length > 1 ? "s" : ""} compressed and ready.`);
    } catch (error) {
      toast.error(error.message || "Failed to prepare images.");
    }
  };

  const handleTagEditSubmit = async (event) => {
    event.preventDefault();

    if (!tagToEdit) {
      return;
    }

    try {
      await updateTag({
        tagId: tagToEdit.id,
        data: tagEditForm,
      }).unwrap();
      toast.success("Tag updated.");
      setTagToEdit(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update tag.");
    }
  };

  const handleDeleteDish = async () => {
    if (!dishToDelete) return;

    try {
      await deleteDish(dishToDelete.id).unwrap();
      toast.success("Dish deleted.");
      setDishToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete dish.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      toast.success("Category deleted.");
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete category.");
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag(tagToDelete.id).unwrap();
      toast.success("Tag deleted.");
      setTagToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete tag.");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success("User deleted.");
      setUserToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-[72px]">
      <section className="bg-brown-dark px-[5%] py-10 text-white">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-3 inline-block rounded-full border border-gold/40 px-4 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-gold-light">
                {t('nav.adminDashboard')}
              </span>
              <h1 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-tight">
                {t('dashboard.overview')} <em className="not-italic text-gold-light">{t('common.control') || 'Control'}</em>
              </h1>
              <p className="mt-2 max-w-[620px] text-[0.94rem] text-white/65">
                {t('dashboard.adminDescription') || 'A working mockup for users, orders, reservations, tables, menu, reviews, roles, and permissions.'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  refetchUsers();
                  refetchOrders();
                  refetchReservations();
                  refetchTables();
                  refetchDishes();
                  refetchCategories();
                  refetchTags();
                  if (shouldLoadReviewAnalysis) {
                    refetchReviewAnalysis();
                  }
                }}
                disabled={isUsersFetching || isOrdersFetching || isReservationsFetching || isTablesFetching || isDishesFetching || isCategoriesFetching || isTagsFetching || isReviewAnalysisFetching}
                className="btn btn-gold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUsersFetching || isOrdersFetching || isReservationsFetching || isTablesFetching || isDishesFetching || isCategoriesFetching || isTagsFetching || isReviewAnalysisFetching ? <ButtonSpinner /> : <i className="fas fa-sync-alt text-[0.75rem]"></i>}
                {isUsersFetching || isOrdersFetching || isReservationsFetching || isTablesFetching || isDishesFetching || isCategoriesFetching || isTagsFetching || isReviewAnalysisFetching ? t('common.refreshing') : t('common.refresh')}
              </button>
              <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/10 p-1.5">
                <select
                  value={exportReport}
                  onChange={(event) => setExportReport(event.target.value)}
                  className="rounded-full border border-white/10 bg-brown-dark px-3 py-2 text-[0.78rem] font-semibold text-white outline-none focus:border-gold"
                >
                  <option value="orders">{t('dashboard.orders')}</option>
                  <option value="reservations">{t('dashboard.reservations')}</option>
                  <option value="review-analysis">{t('ai.analyzeReviews')}</option>
                </select>
                <input
                  type="date"
                  value={exportDate}
                  onChange={(event) => setExportDate(event.target.value)}
                  className="date-input-dark rounded-full border border-white/10 bg-brown-dark px-3 py-2 text-[0.78rem] font-semibold text-white outline-none focus:border-gold"
                />
                <button type="button" onClick={handleExportPdf} className="btn bg-white/10 text-white hover:bg-white/15">
                  <i className="fas fa-download text-[0.75rem]"></i>
                  {t('common.exportPdf') || 'Export PDF'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="rounded-[16px] border border-white/10 bg-white/[0.06] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[0.76rem] uppercase tracking-[0.14em] text-white/55">{metric.label}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-light">
                    <i className={`fas ${metric.icon}`}></i>
                  </span>
                </div>
                <div className="font-['Cormorant_Garamond'] text-[2rem] font-bold leading-none">{metric.value}</div>
                <div className="mt-2 text-[0.8rem] text-white/55">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-[80] border-b border-[rgba(200,146,42,0.14)] dark:border-gold/20 bg-[rgba(250,245,236,0.96)] dark:bg-[rgba(26,15,0,0.96)] px-[5%] py-3 shadow-[0_4px_20px_rgba(26,15,0,0.06)] backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {sections(t).map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.8rem] font-semibold transition-all ${
                activeSection === section.id
                  ? "border-gold bg-gold text-white shadow-[0_3px_12px_rgba(200,146,42,0.28)]"
                  : "dash-tab-inactive border-beige bg-white text-text-mid hover:border-gold hover:text-gold"
              }`}
            >
              <i className={`fas ${section.icon} text-[0.75rem]`}></i>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[5%] py-10">
        {activeSection === "overview" && (
          <section className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Live Flow" title="Recent Orders" />
              <div className="mt-5">
                {isOrdersError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load orders.
                  </div>
                ) : (
                  <div className="relative min-h-[220px]">
                    {adminOrders.length > 0 && <SimpleTable columns={["Order", "Customer", "Items", "Total", "Status", ""]} rows={orderRows} />}
                    {!isOrdersBusy && adminOrders.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No orders found.
                      </div>
                    )}
                    {isOrdersBusy && <LoadingOverlay label={isOrdersLoading ? "Loading orders..." : "Refreshing orders..."} />}
                  </div>
                )}
              </div>
            </AdminCard>
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Tonight" title="Reservation Queue" />
              <div className="relative mt-5 min-h-[220px]">
                {isReservationsError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load reservations.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {adminReservations.slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="rounded-[12px] border border-beige bg-cream/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-[0.9rem] text-brown-dark">{reservation.user?.name || "Guest"}</strong>
                          <StatusBadge value={reservation.status} />
                        </div>
                        <p className="mt-1 text-[0.82rem] text-text-mid">
                          Table {reservation.table?.number || reservation.table_id} · {formatDate(reservation.reservation_date)} · {formatTimeRange(reservation)}
                        </p>
                      </div>
                    ))}
                    {!isReservationsBusy && adminReservations.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No reservations found.
                      </div>
                    )}
                  </div>
                )}
                {isReservationsBusy && <LoadingOverlay label={isReservationsLoading ? "Loading reservations..." : "Refreshing reservations..."} />}
              </div>
            </AdminCard>
          </section>
        )}

        <div className="grid grid-cols-1 gap-8">
          {visibleSections.includes("users") && (
            <AdminCard className="p-6">
              <SectionHeader
                eyebrow="Access"
                title="Users Management"
                action={showCreateUserForm ? "Close Form" : "Add Staff"}
                onAction={() => setShowCreateUserForm((value) => !value)}
              />
              <div className="mt-5">
                {showCreateUserForm && (
                  <form onSubmit={handleCreateUser} className="mb-5 rounded-[14px] border border-beige bg-cream/70 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-['Cormorant_Garamond'] text-[1.35rem] font-bold text-brown-dark">New User</h3>
                        <p className="text-[0.82rem] text-text-mid">Create staff or client access with an assigned role.</p>
                      </div>
                      <button
                        type="submit"
                        disabled={isCreatingUser}
                        className="btn btn-gold !px-5 !py-2.5"
                      >
                        {isCreatingUser ? <ButtonSpinner /> : <i className="fas fa-user-plus text-[0.72rem]"></i>}
                        {isCreatingUser ? "Creating..." : "Create User"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <input
                        required
                        value={newUser.name}
                        onChange={(event) => setNewUser((user) => ({ ...user, name: event.target.value }))}
                        placeholder="Full name"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        required
                        type="email"
                        value={newUser.email}
                        onChange={(event) => setNewUser((user) => ({ ...user, email: event.target.value }))}
                        placeholder="Email"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        required
                        type="password"
                        value={newUser.password}
                        onChange={(event) => setNewUser((user) => ({ ...user, password: event.target.value }))}
                        placeholder="Password"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        value={newUser.phone_number}
                        onChange={(event) => setNewUser((user) => ({ ...user, phone_number: event.target.value }))}
                        placeholder="Phone number"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        value={newUser.adress}
                        onChange={(event) => setNewUser((user) => ({ ...user, adress: event.target.value }))}
                        placeholder="Address"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <select
                        value={newUser.role}
                        onChange={(event) => setNewUser((user) => ({ ...user, role: event.target.value }))}
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] capitalize outline-none focus:border-gold"
                      >
                        {availableRoles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                )}
                {isUsersError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load users. Check that your admin account has the manage-users permission.
                  </div>
                ) : (
                  <div className="relative min-h-[360px]">
                    {adminUsers.length > 0 && (
                      <SimpleTable
                        columns={["Name", "Email", "Role", "Phone", "Joined", "Actions"]}
                        rows={adminUsers.map((user) => {
                          const currentRole = user.roles?.[0]?.name || "";

                          return [
                            <strong className="text-brown-dark">{user.name}</strong>,
                            user.email,
                            <select
                              value={currentRole}
                              disabled={isUpdatingRole}
                              onChange={(event) => handleRoleChange(user.id, event.target.value)}
                              className="rounded-full border border-beige bg-gold-pale px-3 py-1 text-[0.72rem] font-semibold capitalize text-gold outline-none focus:border-gold"
                            >
                              {availableRoles.map((role) => (
                                <option key={role.id} value={role.name}>
                                  {role.name}
                                </option>
                              ))}
                            </select>,
                            user.phone_number || "N/A",
                            user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A",
                            <button
                              type="button"
                              disabled={isDeletingUser}
                              onClick={() => setUserToDelete(user)}
                              className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f] transition-all hover:bg-[#9b3f2f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                            <span className="inline-flex items-center gap-2">
                              {isDeletingUser && <ButtonSpinner />}
                              Delete
                            </span>
                          </button>,
                          ];
                        })}
                      />
                    )}
                    {!isUsersBusy && adminUsers.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No users found.
                      </div>
                    )}
                    {isUsersBusy && <LoadingOverlay label={isUsersLoading ? "Loading users..." : "Refreshing users..."} />}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[0.8rem] text-text-mid">
                        Showing {usersResponse?.from || 0}-{usersResponse?.to || 0} of {usersResponse?.total || 0}
                        {isUsersFetching ? " · refreshing..." : ""}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {paginationLinks.map((link, index) => (
                          <button
                            key={`${link.label}-${index}`}
                            type="button"
                            disabled={!link.url || link.active}
                            onClick={() => {
                              const page = new URL(link.url).searchParams.get("page");
                              setUsersPage(Number(page));
                            }}
                            className={`min-w-9 rounded-full border px-3 py-2 text-[0.78rem] font-semibold transition-all ${
                              link.active
                                ? "border-gold bg-gold text-white"
                                : "border-beige bg-white text-text-mid hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("orders") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Kitchen" title="Orders Management" />
              <div className="mt-5">
                {isOrdersError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load orders. Check that your admin account has the manage-orders permission.
                  </div>
                ) : (
                  <div className="relative min-h-[360px]">
                    {adminOrders.length > 0 && (
                      <SimpleTable columns={["Order", "Customer", "Items", "Total", "Status", "Actions"]} rows={orderRows} />
                    )}
                    {!isOrdersBusy && adminOrders.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No orders found.
                      </div>
                    )}
                    {isOrdersBusy && <LoadingOverlay label={isOrdersLoading ? "Loading orders..." : "Refreshing orders..."} />}
                  </div>
                )}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("reservations") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Dining Room" title="Reservations Management" />
              <div className="mt-5">
                {isReservationsError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load reservations. Check that your admin account has the manage-reservation permission.
                  </div>
                ) : (
                  <div className="relative min-h-[360px]">
                    {adminReservations.length > 0 && (
                      <SimpleTable
                        columns={["Guest", "Table", "Date", "Time", "Guests", "Status", "Actions"]}
                        rows={adminReservations.map((reservation) => [
                          <strong className="text-brown-dark">{reservation.user?.name || "Guest"}</strong>,
                          `Table ${reservation.table?.number || reservation.table_id}`,
                          <input
                            type="date"
                            value={reservation.reservation_date || ""}
                            disabled={isUpdatingReservation}
                            onChange={(event) => handleReservationUpdate(reservation.id, { reservation_date: event.target.value })}
                            className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                          />,
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="time"
                              value={reservation.start_time || ""}
                              disabled={isUpdatingReservation}
                              onChange={(event) => handleReservationUpdate(reservation.id, { start_time: event.target.value })}
                              className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                            />
                            <input
                              type="time"
                              value={reservation.end_time || ""}
                              disabled={isUpdatingReservation}
                              onChange={(event) => handleReservationUpdate(reservation.id, { end_time: event.target.value })}
                              className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                            />
                          </div>,
                          reservation.guests_number || "N/A",
                          <select
                            value={reservation.status}
                            disabled={isUpdatingReservation}
                            onChange={(event) => handleReservationUpdate(reservation.id, { status: event.target.value })}
                            className="rounded-full border border-beige bg-gold-pale px-3 py-1 text-[0.72rem] font-semibold capitalize text-gold outline-none focus:border-gold"
                          >
                            {reservationStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>,
                          <button
                            type="button"
                            disabled={isDeletingReservation}
                            onClick={() => setReservationToDelete(reservation)}
                            className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f] transition-all hover:bg-[#9b3f2f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="inline-flex items-center gap-2">
                              {isDeletingReservation && <ButtonSpinner />}
                              Delete
                            </span>
                          </button>,
                        ])}
                      />
                    )}
                    {!isReservationsBusy && adminReservations.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No reservations found.
                      </div>
                    )}
                    {isReservationsBusy && <LoadingOverlay label={isReservationsLoading ? "Loading reservations..." : "Refreshing reservations..."} />}
                  </div>
                )}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("tables") && (
            <AdminCard className="p-6">
              <SectionHeader
                eyebrow="Floor Plan"
                title="Tables Management"
                action={showCreateTableForm ? "Close Form" : "Add Table"}
                onAction={() => setShowCreateTableForm((value) => !value)}
              />
              <div className="mt-5">
                {showCreateTableForm && (
                  <form onSubmit={handleCreateTable} className="mb-5 rounded-[14px] border border-beige bg-cream/70 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-['Cormorant_Garamond'] text-[1.35rem] font-bold text-brown-dark">New Table</h3>
                        <p className="text-[0.82rem] text-text-mid">Add a dining table and set its capacity and availability.</p>
                      </div>
                      <button type="submit" disabled={isCreatingTable} className="btn btn-gold !px-5 !py-2.5">
                        {isCreatingTable ? <ButtonSpinner /> : <i className="fas fa-chair text-[0.72rem]"></i>}
                        {isCreatingTable ? "Creating..." : "Create Table"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <input
                        required
                        value={newTable.name}
                        onChange={(event) => setNewTable((table) => ({ ...table, name: event.target.value }))}
                        placeholder="Table name"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        required
                        type="number"
                        min="1"
                        value={newTable.number}
                        onChange={(event) => setNewTable((table) => ({ ...table, number: event.target.value }))}
                        placeholder="Number"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <input
                        required
                        type="number"
                        min="1"
                        value={newTable.capacity}
                        onChange={(event) => setNewTable((table) => ({ ...table, capacity: event.target.value }))}
                        placeholder="Capacity"
                        className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold"
                      />
                      <label className="flex items-center gap-3 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] text-text-mid">
                        <input
                          type="checkbox"
                          checked={newTable.is_available}
                          onChange={(event) => setNewTable((table) => ({ ...table, is_available: event.target.checked }))}
                          className="h-4 w-4 accent-[#c8922a]"
                        />
                        Available
                      </label>
                    </div>
                  </form>
                )}
                {isTablesError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load tables. Check that your admin account has the manage-tables permission.
                  </div>
                ) : (
                  <div className="relative min-h-[360px]">
                    {adminTables.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {adminTables.map((table) => (
                          <div key={table.id} className="rounded-[14px] border border-beige bg-cream/70 p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div>
                                <strong className="text-brown-dark">{table.name}</strong>
                                <p className="text-[0.82rem] text-text-mid">No. {table.number} · {table.capacity} seats</p>
                              </div>
                              <StatusBadge value={table.is_available ? "available" : "hidden"} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={table.name}
                                disabled={isUpdatingTable}
                                onChange={(event) => handleTableUpdate(table.id, { name: event.target.value })}
                                className="col-span-2 rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                              />
                              <input
                                type="number"
                                min="1"
                                value={table.number}
                                disabled={isUpdatingTable}
                                onChange={(event) => handleTableUpdate(table.id, { number: Number(event.target.value) })}
                                className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                              />
                              <input
                                type="number"
                                min="1"
                                value={table.capacity}
                                disabled={isUpdatingTable}
                                onChange={(event) => handleTableUpdate(table.id, { capacity: Number(event.target.value) })}
                                className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] text-text-mid outline-none focus:border-gold"
                              />
                            </div>
                            <div className="mt-4 flex flex-wrap justify-between gap-2">
                              <button
                                type="button"
                                disabled={isUpdatingTable}
                                onClick={() => handleTableUpdate(table.id, { is_available: !table.is_available })}
                                className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {table.is_available ? "Mark Unavailable" : "Mark Available"}
                              </button>
                              <button
                                type="button"
                                disabled={isDeletingTable}
                                onClick={() => setTableToDelete(table)}
                                className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f] transition-all hover:bg-[#9b3f2f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <span className="inline-flex items-center gap-2">
                                  {isDeletingTable && <ButtonSpinner />}
                                  Delete
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isTablesBusy && adminTables.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No tables found.
                      </div>
                    )}
                    {isTablesBusy && <LoadingOverlay label={isTablesLoading ? "Loading tables..." : "Refreshing tables..."} />}
                  </div>
                )}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("menu") && (
            <AdminCard className="p-6">
              <SectionHeader
                eyebrow="Menu"
                title="Dishes, Categories & Tags"
                action={showCreateDishForm ? "Close Form" : "Add Dish"}
                onAction={() => setShowCreateDishForm((value) => !value)}
              />
              <div className="relative mt-5 min-h-[420px]">
                {showCreateDishForm && (
                  <form onSubmit={handleCreateDish} className="mb-5 rounded-[14px] border border-beige bg-cream/70 p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-['Cormorant_Garamond'] text-[1.35rem] font-bold text-brown-dark">New Dish</h3>
                        <p className="text-[0.82rem] text-text-mid">Create a dish and assign it to a category.</p>
                      </div>
                      <button type="submit" disabled={isCreatingDish} className="btn btn-gold !px-5 !py-2.5">
                        {isCreatingDish ? <ButtonSpinner /> : <i className="fas fa-utensils text-[0.72rem]"></i>}
                        {isCreatingDish ? "Creating..." : "Create Dish"}
                      </button>
                    </div>
                    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[12px] border border-beige bg-white p-3">
                      <ImageStrip images={newDish.imagePreviews} name={newDish.name} size="h-16 w-16" />
                      <div className="min-w-0">
                        <strong className="block truncate text-[0.86rem] text-brown-dark">{newDish.name || "Dish preview"}</strong>
                        <span className="block truncate text-[0.74rem] text-text-mid">{newDish.imageFiles.length ? `${newDish.imageFiles.length}/5 image${newDish.imageFiles.length > 1 ? "s" : ""} selected` : "No images selected"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <input required value={newDish.name} onChange={(event) => setNewDish((dish) => ({ ...dish, name: event.target.value }))} placeholder="Dish name" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
                      <select required value={newDish.category_id} onChange={(event) => setNewDish((dish) => ({ ...dish, category_id: event.target.value }))} className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold">
                        <option value="">Category</option>
                        {adminCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <input required type="number" min="0" step="0.01" value={newDish.price} onChange={(event) => setNewDish((dish) => ({ ...dish, price: event.target.value }))} placeholder="Price" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
                      <input value={newDish.description} onChange={(event) => setNewDish((dish) => ({ ...dish, description: event.target.value }))} placeholder="Description" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
                      <label className="flex items-center gap-3 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] text-text-mid">
                        <input type="checkbox" checked={newDish.is_available} onChange={(event) => setNewDish((dish) => ({ ...dish, is_available: event.target.checked }))} className="h-4 w-4 accent-[#c8922a]" />
                        Available
                      </label>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">
                        <i className="fas fa-image"></i>
                        Choose Images
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => handleDishImagesSelect(event.target.files, setNewDish)} className="hidden" />
                      </label>
                    </div>
                  </form>
                )}
                {isDishesError || isCategoriesError || isTagsError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load menu data. Check that your admin account has menu management permissions.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <SimpleTable
                        columns={["Dish", "Category", "Price", "Status", "Actions"]}
                        rows={adminDishes.map((dish) => [
                          <div className="flex items-center gap-3">
                            <ImageStrip images={getDishImages(dish)} name={dish.name} size="h-12 w-12" />
                            <div className="min-w-0">
                              <strong className="block truncate text-brown-dark">{dish.name}</strong>
                              <span className="mt-1 block text-[0.68rem] text-text-mid">{getDishImages(dish).length || 0}/5 images</span>
                            </div>
                          </div>,
                          dish.category?.name || "N/A",
                          formatMoney(dish.price),
                          <StatusBadge value={dish.is_available ? "available" : "hidden"} />,
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => openDishEditForm(dish)} className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">
                              Edit
                            </button>
                            <button type="button" disabled={isUpdatingDish} onClick={() => handleDishAvailabilityChange(dish)} className="rounded-full border border-beige bg-gold-pale px-3 py-1 text-[0.72rem] font-semibold text-gold transition-all hover:border-gold hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                              {isUpdatingDish ? <span className="inline-flex items-center gap-2"><ButtonSpinner />Saving</span> : dish.is_available ? "Hide" : "Show"}
                            </button>
                            <button type="button" disabled={isDeletingDish} onClick={() => setDishToDelete(dish)} className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f] transition-all hover:bg-[#9b3f2f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                              <span className="inline-flex items-center gap-2">{isDeletingDish && <ButtonSpinner />}Delete</span>
                            </button>
                          </div>,
                        ])}
                      />
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[14px] border border-beige bg-cream/70 p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-brown-dark">Categories</h3>
                          <button type="button" onClick={() => setShowCreateCategoryForm((value) => !value)} className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid hover:border-gold hover:text-gold">
                            {showCreateCategoryForm ? "Close" : "Add"}
                          </button>
                        </div>
                        {showCreateCategoryForm && (
                          <form onSubmit={handleCreateCategory} className="mb-3 grid gap-2">
                            <div className="flex items-center gap-3 rounded-[12px] border border-beige bg-white p-3">
                              <CategoryImage image={newCategory.imagePreview} name={newCategory.name} className="h-14 w-14" />
                              <div className="min-w-0">
                                <strong className="block truncate text-[0.82rem] text-brown-dark">{newCategory.name || "Category preview"}</strong>
                                <span className="block truncate text-[0.72rem] text-text-mid">{newCategory.imageFile ? `${newCategory.imageFile.name} - ${(newCategory.imageFile.size / 1024).toFixed(0)} KB` : "No image selected"}</span>
                              </div>
                            </div>
                            <input required value={newCategory.name} onChange={(event) => setNewCategory((category) => ({ ...category, name: event.target.value }))} placeholder="Category name" className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] outline-none focus:border-gold" />
                            <input value={newCategory.description} onChange={(event) => setNewCategory((category) => ({ ...category, description: event.target.value }))} placeholder="Description" className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] outline-none focus:border-gold" />
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">
                              <i className="fas fa-image"></i>
                              Choose Image
                              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleCategoryImageSelect(event.target.files?.[0], setNewCategory)} className="hidden" />
                            </label>
                            <button type="submit" disabled={isCreatingCategory} className="btn btn-gold !px-4 !py-2">{isCreatingCategory && <ButtonSpinner />}Create Category</button>
                          </form>
                        )}
                        <div className="flex flex-col gap-2">
                          {adminCategories.map((category) => (
                            <div key={category.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <div className="flex min-w-0 items-center gap-3 rounded-[10px] border border-beige bg-white px-3 py-2">
                                <CategoryImage image={category.image} name={category.name} />
                                <div className="min-w-0">
                                  <strong className="block truncate text-[0.78rem] text-brown-dark">{category.name}</strong>
                                  {category.description && <span className="mt-1 block truncate text-[0.72rem] text-text-mid">{category.description}</span>}
                                  {category.image && <span className="mt-1 block truncate text-[0.68rem] text-text-mid/70">{category.image}</span>}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => openCategoryEditForm(category)} className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">Edit</button>
                                <button type="button" disabled={isDeletingCategory} onClick={() => setCategoryToDelete(category)} className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f]">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[14px] border border-beige bg-cream/70 p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-brown-dark">Tags</h3>
                          <button type="button" onClick={() => setShowCreateTagForm((value) => !value)} className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid hover:border-gold hover:text-gold">
                            {showCreateTagForm ? "Close" : "Add"}
                          </button>
                        </div>
                        {showCreateTagForm && (
                          <form onSubmit={handleCreateTag} className="mb-3 grid gap-2">
                            <input required value={newTag.name} onChange={(event) => setNewTag({ name: event.target.value })} placeholder="Tag name" className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] outline-none focus:border-gold" />
                            <button type="submit" disabled={isCreatingTag} className="btn btn-gold !px-4 !py-2">{isCreatingTag && <ButtonSpinner />}Create Tag</button>
                          </form>
                        )}
                        <div className="flex flex-col gap-2">
                          {adminTags.map((tag) => (
                            <div key={tag.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <div className="rounded-[10px] border border-beige bg-white px-3 py-2 text-[0.78rem] font-semibold text-brown-dark">{tag.name}</div>
                              <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => openTagEditForm(tag)} className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">Edit</button>
                                <button type="button" disabled={isDeletingTag} onClick={() => setTagToDelete(tag)} className="rounded-full border border-[#e8c5bd] bg-[#f7ece9] px-3 py-1 text-[0.72rem] font-semibold text-[#9b3f2f]">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isMenuBusy && <LoadingOverlay label="Loading menu..." />}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("ai-services") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="AI Services" title="Review Analysis Results" />
              <div className="relative mt-5 min-h-[320px]">
                {isReviewAnalysisError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    {reviewAnalysisError?.data?.detail || reviewAnalysisError?.data?.message || "Failed to analyze reviews. Check the review-analysis service on port 5000."}
                  </div>
                ) : !isReviewAnalysisBusy && !reviewAnalysis ? (
                  <div className="rounded-[12px] border border-beige bg-cream/70 p-6 text-center">
                    <i className="fas fa-comment-slash mb-3 text-2xl text-gold"></i>
                    <p className="text-[0.9rem] font-semibold text-brown-dark">No reviews available for analysis yet.</p>
                    <p className="mt-1 text-[0.82rem] text-text-mid">New customer reviews will be sent to the AI analyzer automatically.</p>
                  </div>
                ) : reviewAnalysis ? (
                  <div className="rounded-[16px] border border-beige bg-cream/70 p-5">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-[820px]">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <StatusBadge value={reviewAnalysis.sentiment} />
                          <span className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                            Confidence {(Number(reviewAnalysis.confidence || 0) * 100).toFixed(0)}%
                          </span>
                          <span className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                            {reviewAnalysis.category || "Restaurant"}
                          </span>
                          <span className="rounded-full border border-beige bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                            {reviewAnalysisResponse.reviewCount} reviews analyzed
                          </span>
                        </div>
                        <p className="text-[0.9rem] leading-7 text-brown-dark">
                          Latest batch includes {analyzedReviews.length} recent review{analyzedReviews.length === 1 ? "" : "s"} from the backend.
                        </p>
                      </div>
                      <div className="min-w-[180px]">
                        <SeverityMeter score={Number(reviewAnalysis.severity_score || 0)} />
                      </div>
                    </div>

                    <AspectGrid aspects={reviewAnalysis.aspects} />

                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                      <div className="rounded-[14px] border border-beige bg-white p-5">
                        <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-text-mid">Key Points</h3>
                        <div className="flex flex-col gap-2">
                          {(reviewAnalysis.key_points || []).map((point) => (
                            <div key={point} className="flex items-start gap-3 text-[0.86rem] text-text-mid">
                              <i className="fas fa-check-circle mt-1 text-gold"></i>
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-[12px] bg-gold-pale p-4 text-[0.85rem] text-brown-dark">
                          <strong>Main issue:</strong> {reviewAnalysis.main_issue || "No primary complaint detected"}
                        </div>
                      </div>

                      <div className="rounded-[14px] border border-beige bg-white p-5">
                        <h3 className="mb-3 text-[0.82rem] font-bold uppercase tracking-[0.14em] text-text-mid">Business Insight</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <div className="mb-1 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-gold">Main Problem</div>
                            <p className="text-[0.86rem] leading-6 text-text-mid">{reviewAnalysis.business_insight?.main_problem || "No main problem identified."}</p>
                          </div>
                          <div>
                            <div className="mb-1 text-[0.76rem] font-bold uppercase tracking-[0.12em] text-gold">Recommendation</div>
                            <p className="text-[0.86rem] leading-6 text-text-mid">{reviewAnalysis.business_insight?.recommendation || "No recommendation returned."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {isReviewAnalysisBusy && <LoadingOverlay label="Analyzing reviews..." />}
              </div>
            </AdminCard>
          )}

          {visibleSections.includes("roles") && (
            <AdminCard className="p-6">
              <SectionHeader eyebrow="Security" title="Roles & Permissions" />
              <div className="relative mt-5 min-h-[320px]">
                {isRolesError ? (
                  <div className="rounded-[12px] border border-[#e8c5bd] bg-[#f7ece9] p-5 text-[0.9rem] text-[#9b3f2f]">
                    Failed to load roles and permissions. Check that your admin account has the manage-roles permission.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {availableRoles.map((role) => (
                      <div key={role.id} className="rounded-[14px] border border-beige bg-cream/70 p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-['Cormorant_Garamond'] text-[1.45rem] font-bold capitalize text-brown-dark">{role.name}</h3>
                            <p className="text-[0.78rem] text-text-mid">{role.permissions?.length || 0} permissions assigned</p>
                          </div>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-pale text-gold">
                            <i className="fas fa-shield-alt"></i>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(role.permissions || []).map((permission) => (
                            <span
                              key={permission.id}
                              className={`rounded-full border px-3 py-1 text-[0.72rem] font-semibold ${getPermissionTone(permission.name)}`}
                            >
                              {permission.name}
                            </span>
                          ))}
                          {(!role.permissions || role.permissions.length === 0) && (
                            <span className="rounded-full border border-[#e8dfd2] bg-white px-3 py-1 text-[0.72rem] font-semibold text-text-mid">
                              No permissions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!isRolesBusy && availableRoles.length === 0 && (
                      <div className="rounded-[12px] border border-beige bg-cream/70 p-5 text-[0.9rem] text-text-mid">
                        No roles found.
                      </div>
                    )}
                  </div>
                )}
                {isRolesBusy && <LoadingOverlay label={isRolesLoading ? "Loading roles..." : "Refreshing roles..."} />}
              </div>
            </AdminCard>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(userToDelete)}
        title="Delete user?"
        message={
          userToDelete
            ? `This will permanently delete ${userToDelete.name}'s account and revoke their active tokens.`
            : ""
        }
        confirmLabel="Delete User"
        isLoading={isDeletingUser}
        onConfirm={handleDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(reservationToDelete)}
        title="Delete reservation?"
        message={
          reservationToDelete
            ? `This will permanently delete the reservation for ${reservationToDelete.user?.name || "this guest"}.`
            : ""
        }
        confirmLabel="Delete Reservation"
        isLoading={isDeletingReservation}
        onConfirm={handleDeleteReservation}
        onCancel={() => setReservationToDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(tableToDelete)}
        title="Delete table?"
        message={
          tableToDelete
            ? `This will permanently delete ${tableToDelete.name}. Existing reservations may depend on this table.`
            : ""
        }
        confirmLabel="Delete Table"
        isLoading={isDeletingTable}
        onConfirm={handleDeleteTable}
        onCancel={() => setTableToDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(dishToDelete)}
        title="Delete dish?"
        message={dishToDelete ? `This will permanently delete ${dishToDelete.name}.` : ""}
        confirmLabel="Delete Dish"
        isLoading={isDeletingDish}
        onConfirm={handleDeleteDish}
        onCancel={() => setDishToDelete(null)}
      />
      {dishToEdit && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(26,15,0,0.55)] px-4 backdrop-blur-[5px]">
          <form onSubmit={handleDishEditSubmit} className="w-full max-w-[560px] rounded-[18px] border border-[rgba(200,146,42,0.18)] bg-white p-6 shadow-custom-lg">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Menu</span>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark">Edit Dish</h3>
              </div>
              <button type="button" onClick={() => setDishToEdit(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-text-mid transition-all hover:bg-gold-pale hover:text-gold">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-4 rounded-[14px] border border-beige bg-cream/70 p-4">
              <ImageStrip images={dishEditForm.imagePreviews} name={dishEditForm.name} size="h-20 w-20" />
              <div className="min-w-0">
                <strong className="block truncate text-brown-dark">{dishEditForm.name || "Dish preview"}</strong>
                <span className="mt-1 block truncate text-[0.78rem] text-text-mid">{dishEditForm.imageFiles.length ? `${dishEditForm.imageFiles.length}/5 replacement image${dishEditForm.imageFiles.length > 1 ? "s" : ""} selected` : `${dishEditForm.imagePreviews.length || 0}/5 current image${dishEditForm.imagePreviews.length === 1 ? "" : "s"}`}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input required value={dishEditForm.name} onChange={(event) => setDishEditForm((dish) => ({ ...dish, name: event.target.value }))} placeholder="Dish name" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
              <select required value={dishEditForm.category_id} onChange={(event) => setDishEditForm((dish) => ({ ...dish, category_id: event.target.value }))} className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold">
                <option value="">Category</option>
                {adminCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input required type="number" min="0" step="0.01" value={dishEditForm.price} onChange={(event) => setDishEditForm((dish) => ({ ...dish, price: event.target.value }))} placeholder="Price" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
              <label className="flex items-center gap-3 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] text-text-mid">
                <input type="checkbox" checked={dishEditForm.is_available} onChange={(event) => setDishEditForm((dish) => ({ ...dish, is_available: event.target.checked }))} className="h-4 w-4 accent-[#c8922a]" />
                Available
              </label>
              <textarea value={dishEditForm.description || ""} onChange={(event) => setDishEditForm((dish) => ({ ...dish, description: event.target.value }))} placeholder="Description" className="min-h-[96px] rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold md:col-span-2" />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold md:col-span-2">
                <i className="fas fa-image"></i>
                Change Images
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => handleDishImagesSelect(event.target.files, setDishEditForm)} className="hidden" />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={isUpdatingDish} onClick={() => setDishToEdit(null)} className="rounded-full border border-beige bg-white px-5 py-2.5 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isUpdatingDish} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[0.86rem] font-semibold text-white transition-all hover:bg-brown disabled:cursor-not-allowed disabled:opacity-70">
                {isUpdatingDish && <ButtonSpinner />}
                {isUpdatingDish ? "Updating..." : "Update Dish"}
              </button>
            </div>
          </form>
        </div>
      )}
      {categoryToEdit && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(26,15,0,0.55)] px-4 backdrop-blur-[5px]">
          <form onSubmit={handleCategoryEditSubmit} className="w-full max-w-[520px] rounded-[18px] border border-[rgba(200,146,42,0.18)] bg-white p-6 shadow-custom-lg">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Menu</span>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark">Edit Category</h3>
              </div>
              <button type="button" onClick={() => setCategoryToEdit(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-text-mid transition-all hover:bg-gold-pale hover:text-gold">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-4 rounded-[14px] border border-beige bg-cream/70 p-4">
                <CategoryImage image={categoryEditForm.imagePreview} name={categoryEditForm.name} className="h-20 w-20" />
                <div className="min-w-0">
                  <strong className="block truncate text-brown-dark">{categoryEditForm.name || "Category preview"}</strong>
                  <span className="mt-1 block truncate text-[0.78rem] text-text-mid">{categoryEditForm.imageFile ? `${categoryEditForm.imageFile.name} - ${(categoryEditForm.imageFile.size / 1024).toFixed(0)} KB` : "Current image"}</span>
                </div>
              </div>
              <input required value={categoryEditForm.name} onChange={(event) => setCategoryEditForm((category) => ({ ...category, name: event.target.value }))} placeholder="Category name" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
              <input value={categoryEditForm.description} onChange={(event) => setCategoryEditForm((category) => ({ ...category, description: event.target.value }))} placeholder="Description" className="rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold">
                <i className="fas fa-image"></i>
                Change Image
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleCategoryImageSelect(event.target.files?.[0], setCategoryEditForm)} className="hidden" />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={isUpdatingCategory} onClick={() => setCategoryToEdit(null)} className="rounded-full border border-beige bg-white px-5 py-2.5 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isUpdatingCategory} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[0.86rem] font-semibold text-white transition-all hover:bg-brown disabled:cursor-not-allowed disabled:opacity-70">
                {isUpdatingCategory && <ButtonSpinner />}
                {isUpdatingCategory ? "Updating..." : "Update Category"}
              </button>
            </div>
          </form>
        </div>
      )}
      {tagToEdit && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(26,15,0,0.55)] px-4 backdrop-blur-[5px]">
          <form onSubmit={handleTagEditSubmit} className="w-full max-w-[420px] rounded-[18px] border border-[rgba(200,146,42,0.18)] bg-white p-6 shadow-custom-lg">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Menu</span>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark">Edit Tag</h3>
              </div>
              <button type="button" onClick={() => setTagToEdit(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-text-mid transition-all hover:bg-gold-pale hover:text-gold">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <input required value={tagEditForm.name} onChange={(event) => setTagEditForm({ name: event.target.value })} placeholder="Tag name" className="w-full rounded-[12px] border border-beige bg-white px-4 py-3 text-[0.86rem] outline-none focus:border-gold" />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={isUpdatingTag} onClick={() => setTagToEdit(null)} className="rounded-full border border-beige bg-white px-5 py-2.5 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isUpdatingTag} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[0.86rem] font-semibold text-white transition-all hover:bg-brown disabled:cursor-not-allowed disabled:opacity-70">
                {isUpdatingTag && <ButtonSpinner />}
                {isUpdatingTag ? "Updating..." : "Update Tag"}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Delete category?"
        message={categoryToDelete ? `This will permanently delete ${categoryToDelete.name}. Dishes may depend on this category.` : ""}
        confirmLabel="Delete Category"
        isLoading={isDeletingCategory}
        onConfirm={handleDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(tagToDelete)}
        title="Delete tag?"
        message={tagToDelete ? `This will permanently delete ${tagToDelete.name}.` : ""}
        confirmLabel="Delete Tag"
        isLoading={isDeletingTag}
        onConfirm={handleDeleteTag}
        onCancel={() => setTagToDelete(null)}
      />
      {selectedOrderId && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(26,15,0,0.55)] px-4 backdrop-blur-[5px]">
          <div className="w-full max-w-[640px] rounded-[18px] border border-[rgba(200,146,42,0.18)] bg-white p-6 shadow-custom-lg">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-beige pb-4">
              <div>
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold">Order Details</span>
                <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-bold text-brown-dark">
                  Order #{selectedOrderId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-text-mid transition-all hover:bg-gold-pale hover:text-gold"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {isOrderDetailsLoading ? (
              <div className="relative min-h-[220px]">
                <LoadingOverlay label="Loading order..." />
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-[12px] border border-beige bg-cream/70 p-4">
                    <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Customer</div>
                    <strong className="text-brown-dark">{selectedOrder?.user?.name || "Unknown"}</strong>
                    <p className="mt-1 text-[0.8rem] text-text-mid">{selectedOrder?.user?.email || "No email"}</p>
                  </div>
                  <div className="rounded-[12px] border border-beige bg-cream/70 p-4">
                    <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Status</div>
                    <StatusBadge value={selectedOrder?.status || "pending"} />
                  </div>
                  <div className="rounded-[12px] border border-beige bg-cream/70 p-4">
                    <div className="mb-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-text-mid">Total</div>
                    <strong className="text-brown-dark">{formatMoney(selectedOrder?.total_price)}</strong>
                  </div>
                </div>

                <div className="rounded-[14px] border border-beige">
                  <SimpleTable
                    columns={["Dish", "Quantity", "Price"]}
                    rows={(selectedOrder?.items || []).map((item) => [
                      <strong className="text-brown-dark">{item.dish?.name || "Dish"}</strong>,
                      item.quantity,
                      formatMoney(item.price),
                    ])}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
