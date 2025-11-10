import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { contactService, ContactMessage } from "@/services/contact.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminSupport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      toast({
        title: "error",
        description: "failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "new" | "in_progress" | "resolved"
  ) => {
    try {
      setProcessingId(id);
      await contactService.updateMessageStatus(
        id,
        status,
        status === "resolved" ? user?.id : undefined
      );
      await loadMessages();
      toast({
        title: "success",
        description: `message marked as ${status.replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Failed to update message status:", error);
      toast({
        title: "error",
        description: "failed to update message status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newCount = messages.filter(m => m.status === "new").length;
  const inProgressCount = messages.filter(m => m.status === "in_progress").length;
  const resolvedCount = messages.filter(m => m.status === "resolved").length;

  return (
    <AdminLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">support messages</h1>
            <p className="text-muted-foreground">manage customer inquiries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">new messages</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newCount}</div>
                <p className="text-xs text-muted-foreground mt-1">awaiting response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">in progress</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground mt-1">being handled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedCount}</div>
                <p className="text-xs text-muted-foreground mt-1">completed</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>all messages</CardTitle>
                    <CardDescription>review and respond to contact messages</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="new">
                  <TabsList>
                    <TabsTrigger value="new">new ({newCount})</TabsTrigger>
                    <TabsTrigger value="in_progress">in progress ({inProgressCount})</TabsTrigger>
                    <TabsTrigger value="resolved">resolved</TabsTrigger>
                    <TabsTrigger value="all">all</TabsTrigger>
                  </TabsList>

                  <TabsContent value="new" className="space-y-4 mt-6">
                    {filteredMessages.filter(m => m.status === "new").map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{msg.subject}</h3>
                                <Badge variant="destructive">new</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{msg.message}</p>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div><span className="font-medium">from:</span> {msg.name}</div>
                                <div><span className="font-medium">email:</span> {msg.email}</div>
                                <div><span className="font-medium">sent:</span> {new Date(msg.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(msg.id, "in_progress")}
                                disabled={processingId === msg.id}
                              >
                                {processingId === msg.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "start working"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(msg.id, "resolved")}
                                disabled={processingId === msg.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                resolve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredMessages.filter(m => m.status === "new").length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        no new messages
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="in_progress" className="space-y-4 mt-6">
                    {filteredMessages.filter(m => m.status === "in_progress").map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{msg.subject}</h3>
                                <Badge variant="secondary">in progress</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{msg.message}</p>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">from:</span> {msg.name} ({msg.email})
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(msg.id, "resolved")}
                              disabled={processingId === msg.id}
                            >
                              {processingId === msg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  mark resolved
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredMessages.filter(m => m.status === "in_progress").length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        no messages in progress
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="resolved" className="space-y-4 mt-6">
                    {filteredMessages.filter(m => m.status === "resolved").map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{msg.subject}</h3>
                                <Badge variant="default">resolved</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{msg.message}</p>
                              <div className="text-sm text-muted-foreground">
                                {msg.name} - {msg.email}
                                {msg.resolved_at && ` • resolved on ${new Date(msg.resolved_at).toLocaleString()}`}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(msg.id, "new")}
                              disabled={processingId === msg.id}
                            >
                              {processingId === msg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "reopen"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredMessages.filter(m => m.status === "resolved").length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        no resolved messages
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4 mt-6">
                    {filteredMessages.map(msg => (
                      <Card key={msg.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{msg.subject}</h3>
                            <Badge variant={msg.status === "new" ? "destructive" : msg.status === "in_progress" ? "secondary" : "default"}>
                              {msg.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {msg.name} - {msg.email} • {new Date(msg.created_at).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredMessages.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        no messages found
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
