import * as React from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "@/store/snackbar";
import {
  Badge,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { DomainDivider, PostActionsBar } from "@/components/shared";
import { ReportModel, User } from "@/api/api_types";
import { acceptReport, getReports, rejectReport } from "@/api/report";
import { changePrivileges, getUsers } from "@/api/user";

const AdminPage: React.FC = () => {
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [reports, setReports] = React.useState<ReportModel<null>[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports({all: true});
        console.log(data);
        if (data.success && data.data != null) {
          setReports(data.data);
        } else {
          snackbar("error", "Unauthorized");
        }
      } catch (err) {
        console.log(err);
      }
    };

    const fetchUsers = async () => {
      try {
        const data = await getUsers({all: true});
        console.log(data);
        if (data.success && data.data != null) {
          setUsers(data.data);
        } else {
          snackbar("error", "Unauthorized");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchReports();
    fetchUsers();
  }, []);

  return (
    <Stack direction="column" gap={2} sx={{ height: "100%", padding: "20px" }}>
      <Typography variant="h4" color="#fff">
        Users
      </Typography>
      <DomainDivider color={theme.palette.primary.main} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",

          alignItems: "flex-start",
        }}
      >
        {users.map((report, index) => (
          <UserCard key={index} user={report} />
        ))}
      </div>
      <Typography variant="h4" color="#fff">
        Reports
      </Typography>
      <DomainDivider color={theme.palette.primary.main} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px",

          alignItems: "flex-start",
        }}
      >
        {reports.map((report, index) => (
          <ReportComponent key={index} report={report} />
        ))}
      </div>
    </Stack>
  );
};

type ReportProps<T> = {
  report: ReportModel<T>;
};

const ReportComponent: React.FC<ReportProps<any>> = ({ report }) => {
  const [state, setState] = React.useState<boolean | null>(null);
  const snackbar = useSnackbar();

  const formatDate = (dateString: string): string => {
    const timestamp = Date.parse(dateString);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}/${month}/${day}`;
  };

  const renderEntityDetails = (entity: any) => {
    return Object.entries(entity).map(([key, value], index) => (
      <div key={index}>
        <strong>{key}</strong>: {value as any}
      </div>
    ));
  };

  const styles = {
    content: {
      fontSize: "16px",
      color: "#333",
    },
    userInfo: {
      fontSize: "14px",
      color: "#999",
    },
    date: {
      fontSize: "12px",
      color: "#999",
    },
  };

  const onAccept = async () => {
    try {
      const data = await acceptReport(report.report_id);
      console.log(data);
      if (data.success) {
        setState(true);
      } else {
        snackbar("error", "Unauthorized");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onReject = async () => {
    try {
      const data = await rejectReport(report.report_id);
      console.log(data);
      if (data.success) {
        setState(false);
      } else {
        snackbar("error", "Unauthorized");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        margin: "10px",
        backgroundColor: "white",
        borderRadius: "5px",
        minHeight: "200px",
        minWidth: "200px",
      }}
    >
      <div style={styles.userInfo}>@{report.username}</div>
      <div style={styles.date}>
        {formatDate(report.created_at as unknown as string)}
      </div>
      <br />
      <div style={styles.content}>{report.content}</div>
      <br />
      <div>{renderEntityDetails(report.entity.data)}</div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {state == null && (
          <>
            <button
              style={{
                padding: "10px 20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#fff",
              }}
              onClick={() => onAccept()}
            >
              ✓ Accept
            </button>
            <button
              style={{
                padding: "10px 20px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: "#fff",
              }}
              onClick={() => onReject()}
            >
              ✕ Reject
            </button>
          </>
        )}
        {state && <>✓ Accepted</>}
        {state == false && <>✕ Rejected</>}
      </div>
    </div>
  );
};

type UserCardProps = {
  user: User;
};

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const snackbar = useSnackbar();
  const [privileges, setPrivileges] = React.useState<string>(user.privileges);

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: "10px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      maxWidth: "300px",
      margin: "10px",
    },
    username: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333",
    },
  };


  const defaultImage =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  const onPrivilegesChange = async (value: string) => {
    try {
      const data = await changePrivileges(user.user_id, { privileges: value });
      console.log(data);
      if (data.success && data.data != null) {
        setPrivileges(data.data.privileges);
      } else {
        snackbar("error", "Unauthorized");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={styles.container}>
      <img
        src={user.profile_image ?? defaultImage}
        alt={`${user.username}'s profile`}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          marginRight: "10px",
          objectFit: "cover",
          border: "2px solid #ddd",
        }}
      />
      <div style={styles.username}>{user.username}</div>
      <select
        value={privileges}
        onChange={(value) => onPrivilegesChange(value.target.value)}
        style={{
          marginLeft: "10px",
          padding: "5px",
          borderRadius: "5px",
          fontSize: "14px",
          backgroundColor: "#fff",
        }}
      >
        <option value="N">None</option>
        <option value="M">Moderator</option>
        <option value="A">Admin</option>
      </select>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      navbar: true,
    },
  };
}

export default AdminPage;
