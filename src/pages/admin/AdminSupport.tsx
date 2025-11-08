import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  category: "payment" | "technical" | "account" | "item" | "store";
}

const mockTickets: SupportTicket[] = [
  {
    id: "ticket1",
    subject: "Payment not received",
    description: "I sold an item 3 days ago but haven't received the payout yet.",
    userId: "user1",
    userName: "Emma S.",
    userEmail: "emma@example.com",
    priority: "high",
    status: "open",
    createdAt: "2025-01-15",
    category: "payment",
  },
  {
    id: "ticket2",
    subject: "Cannot upload photos",
    description: "Getting an error when trying to upload item photos from my phone.",
    userId: "user2",
    userName: "Lucas M.",
    userEmail: "lucas@example.com",
    priority: "medium",
    status: "in_progress",
    createdAt: "2025-01-14",
    category: "technical",
  },
  {
    id: "ticket3",
    subject: "Store not responding",
    description: "The store hasn't processed my drop-off for over a week.",
    userId: "user3",
    userName: "Sophie K.",
    userEmail: "sophie@example.com",
    priority: "medium",
    status: "open",
    createdAt: "2025-01-13",
    category: "store",
  },
  {
    id: "ticket4",
    subject: "Account verification",
    description: "Need help verifying my account to start selling.",
    userId: "user4",
    userName: "Noah P.",
    userEmail: "noah@example.com",
    priority: "low",
    status: "resolved",
    createdAt: "2025-01-10",
    category: "account",
  },
];

const AdminSupport = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState("");

  const handleResolve = (id: string) => {
    setTickets(prev =>
      prev.map(ticket => ticket.id === id ? { ...ticket, status: "resolved" as const } : ticket)
    );
  };

  const handleInProgress = (id: string) => {
    setTickets(prev =>
      prev.map(ticket => ticket.id === id ? { ...ticket, status: "in_progress" as const } : ticket)
    );
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  return (
    <AdminLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Support Tickets</h1>
            <p className="text-muted-foreground">Manage user support requests</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Being handled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Tickets</CardTitle>
                  <CardDescription>Review and respond to support requests</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="open">
                <TabsList>
                  <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-4 mt-6">
                  {filteredTickets.filter(t => t.status === "open").map(ticket => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                              <Badge variant={ticket.priority === "high" ? "destructive" : "secondary"}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div><span className="font-medium">User:</span> {ticket.userName}</div>
                              <div><span className="font-medium">Email:</span> {ticket.userEmail}</div>
                              <div><span className="font-medium">Created:</span> {ticket.createdAt}</div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" onClick={() => handleInProgress(ticket.id)}>
                              Start Working
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleResolve(ticket.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredTickets.filter(t => t.status === "open").length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No open tickets
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="in_progress" className="space-y-4 mt-6">
                  {filteredTickets.filter(t => t.status === "in_progress").map(ticket => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                              <Badge>In Progress</Badge>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">User:</span> {ticket.userName} ({ticket.userEmail})
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleResolve(ticket.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="resolved" className="space-y-4 mt-6">
                  {filteredTickets.filter(t => t.status === "resolved").map(ticket => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                          <Badge variant="default">Resolved</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ticket.userName} - {ticket.userEmail}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredTickets.map(ticket => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                          <Badge variant={ticket.status === "resolved" ? "default" : "secondary"}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
