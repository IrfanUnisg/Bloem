import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, AlertCircle, CheckCircle, Loader2, RotateCcw } from "lucide-react";
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>all messages</CardTitle>
                    <CardDescription>review and respond to contact messages</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
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
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{msg.subject}</h3>
                                <Badge variant="destructive" className="w-fit">new</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap break-words">{msg.message}</p>
                              <div className="flex flex-col gap-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="truncate"><span className="font-medium">from:</span> {msg.name}</div>
                                <div className="truncate"><span className="font-medium">email:</span> {msg.email}</div>
                                <div className="truncate"><span className="font-medium">sent:</span> {new Date(msg.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(msg.id, "in_progress")}
                                disabled={processingId === msg.id}
                                className="w-full sm:w-auto"
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
                                className="w-full sm:w-auto"
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
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{msg.subject}</h3>
                                <Badge variant="secondary" className="w-fit">in progress</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap break-words">{msg.message}</p>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                <span className="font-medium">from:</span> {msg.name} ({msg.email})
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(msg.id, "resolved")}
                              disabled={processingId === msg.id}
                              className="w-full sm:w-auto"
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
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{msg.subject}</h3>
                                <Badge variant="outline" className="w-fit">resolved</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap break-words">{msg.message}</p>
                              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                                <span className="font-medium">from:</span> {msg.name} ({msg.email})
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(msg.id, "new")}
                              disabled={processingId === msg.id}
                              className="w-full sm:w-auto"
                            >
                              {processingId === msg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  reopen
                                </>
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
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{msg.subject}</h3>
                              <Badge variant={msg.status === "new" ? "destructive" : msg.status === "in_progress" ? "secondary" : "outline"} className="w-fit">
                                {msg.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{msg.message}</p>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              <div className="truncate"><span className="font-medium">from:</span> {msg.name}</div>
                              <div className="truncate"><span className="font-medium">email:</span> {msg.email}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
