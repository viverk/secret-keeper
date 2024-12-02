import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminPanel = () => {
  // TODO: Implement real data fetching
  const secrets = [
    {
      id: "1",
      created: new Date().toLocaleString(),
      expiryType: "time",
      expiryValue: 15,
      status: "active",
    },
    {
      id: "2",
      created: new Date().toLocaleString(),
      expiryType: "views",
      expiryValue: 2,
      status: "expired",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white p-4">
      <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expiry Type</TableHead>
                <TableHead>Expiry Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secrets.map((secret) => (
                <TableRow key={secret.id}>
                  <TableCell className="font-mono">{secret.id}</TableCell>
                  <TableCell>{secret.created}</TableCell>
                  <TableCell>{secret.expiryType}</TableCell>
                  <TableCell>{secret.expiryValue}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        secret.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {secret.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;