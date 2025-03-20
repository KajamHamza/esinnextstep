
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  CheckCircle2, 
  Code, 
  FileText, 
  Lightbulb, 
  Link as LinkIcon, 
  MessageCircle, 
  Plus, 
  ThumbsUp, 
  Users,
  Timer
} from "lucide-react";
import { SquadActivity, SquadActivityComment } from "@/types/squadActivities";

interface SquadMember {
  id: string;
  student_id: string;
  role: string;
  joined_at: string;
  student: {
    first_name: string;
    last_name: string;
    profile_image_url: string;
  };
}

interface SquadActivitiesProps {
  squadId: string;
  members: SquadMember[];
  isAdmin: boolean;
}

export const SquadActivities = ({ squadId, members, isAdmin }: SquadActivitiesProps) => {
  const [activities, setActivities] = useState<SquadActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<SquadActivity | null>(null);
  const [comments, setComments] = useState<SquadActivityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { toast } = useToast();
  
  // New activity form state
  const [newActivity, setNewActivity] = useState({
    type: 'discussion',
    title: '',
    description: '',
    due_date: '',
    link: '',
  });

  useEffect(() => {
    fetchActivities();
  }, [squadId]);
  
  useEffect(() => {
    if (selectedActivity) {
      fetchComments(selectedActivity.id);
    }
  }, [selectedActivity]);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data: activitiesData, error } = await supabase
        .from('peer_squad_activities')
        .select(`*`)
        .eq('squad_id', squadId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Now fetch creator details for each activity
      const activitiesWithCreators = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const { data: creatorData } = await supabase
            .from('student_profiles')
            .select('first_name, last_name, profile_image_url')
            .eq('id', activity.creator_id)
            .single();
          
          return {
            ...activity,
            creator: creatorData
          } as SquadActivity;
        })
      );
      
      setActivities(activitiesWithCreators);
    } catch (error: any) {
      console.error("Error fetching squad activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load squad activities"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchComments = async (activityId: string) => {
    try {
      const { data: commentsData, error } = await supabase
        .from('peer_squad_activity_comments')
        .select(`*`)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Fetch author details for each comment
      const commentsWithAuthors = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: authorData } = await supabase
            .from('student_profiles')
            .select('first_name, last_name, profile_image_url')
            .eq('id', comment.author_id)
            .single();
          
          return {
            ...comment,
            author: authorData
          } as SquadActivityComment;
        })
      );
      
      setComments(commentsWithAuthors);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load comments"
      });
    }
  };
  
  const postComment = async () => {
    if (!selectedActivity || !newComment.trim()) return;
    
    try {
      setPosting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('peer_squad_activity_comments')
        .insert({
          activity_id: selectedActivity.id,
          author_id: session.user.id,
          content: newComment
        });
        
      if (error) throw error;
      
      setNewComment('');
      fetchComments(selectedActivity.id);
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the activity"
      });
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post your comment"
      });
    } finally {
      setPosting(false);
    }
  };
  
  const createActivity = async () => {
    try {
      if (!newActivity.title.trim() || !newActivity.description.trim()) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please provide a title and description"
        });
        return;
      }
      
      setPosting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('peer_squad_activities')
        .insert({
          squad_id: squadId,
          creator_id: session.user.id,
          type: newActivity.type as any,
          title: newActivity.title,
          description: newActivity.description,
          due_date: newActivity.due_date || null,
          link: newActivity.link || null,
          status: 'active'
        });
        
      if (error) throw error;
      
      // Reset form
      setNewActivity({
        type: 'discussion',
        title: '',
        description: '',
        due_date: '',
        link: '',
      });
      
      // Refresh activities
      fetchActivities();
      
      toast({
        title: "Activity Created",
        description: "Your activity has been added to the squad"
      });
    } catch (error: any) {
      console.error("Error creating activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the activity"
      });
    } finally {
      setPosting(false);
    }
  };
  
  const updateActivityStatus = async (activityId: string, status: 'active' | 'completed') => {
    try {
      const { error } = await supabase
        .from('peer_squad_activities')
        .update({ status })
        .eq('id', activityId);
        
      if (error) throw error;
      
      // Update local state
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status } 
          : activity
      ));
      
      if (selectedActivity?.id === activityId) {
        setSelectedActivity(prev => prev ? { ...prev, status } : null);
      }
      
      toast({
        title: `Activity ${status === 'completed' ? 'Completed' : 'Reopened'}`,
        description: `The activity has been marked as ${status}`
      });
    } catch (error: any) {
      console.error("Error updating activity status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the activity status"
      });
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="h-5 w-5 text-blue-500" />;
      case 'discussion':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'resource':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'challenge':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'meeting':
        return <Calendar className="h-5 w-5 text-red-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getActivityTypeBadge = (type: string) => {
    switch (type) {
      case 'project':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Project</Badge>;
      case 'discussion':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Discussion</Badge>;
      case 'resource':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Resource</Badge>;
      case 'challenge':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Challenge</Badge>;
      case 'meeting':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Meeting</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Squad Activities</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Squad Activity</DialogTitle>
              <DialogDescription>
                Create an activity for your squad to collaborate on
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="activity-type" className="text-right text-sm">
                  Type
                </label>
                <select
                  id="activity-type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                >
                  <option value="discussion">Discussion</option>
                  <option value="project">Project</option>
                  <option value="resource">Resource</option>
                  <option value="challenge">Challenge</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="activity-title" className="text-right text-sm">
                  Title
                </label>
                <Input
                  id="activity-title"
                  placeholder="Add a title..."
                  className="col-span-3"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="activity-description" className="text-right text-sm">
                  Description
                </label>
                <Textarea
                  id="activity-description"
                  placeholder="Describe the activity..."
                  className="col-span-3"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
              </div>
              {newActivity.type === 'meeting' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="activity-date" className="text-right text-sm">
                    Date
                  </label>
                  <Input
                    id="activity-date"
                    type="datetime-local"
                    className="col-span-3"
                    value={newActivity.due_date}
                    onChange={(e) => setNewActivity({ ...newActivity, due_date: e.target.value })}
                  />
                </div>
              )}
              {(newActivity.type === 'resource' || newActivity.type === 'project') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="activity-link" className="text-right text-sm">
                    Link
                  </label>
                  <Input
                    id="activity-link"
                    type="url"
                    placeholder="https://"
                    className="col-span-3"
                    value={newActivity.link}
                    onChange={(e) => setNewActivity({ ...newActivity, link: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={createActivity} disabled={posting}>
                {posting ? "Creating..." : "Create Activity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Activity list and details */}
      <div className="grid lg:grid-cols-7 gap-6">
        {/* Activity List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <Card 
                key={activity.id} 
                className={`cursor-pointer transition-all ${
                  selectedActivity?.id === activity.id 
                    ? 'ring-2 ring-purple-500' 
                    : 'hover:shadow-md'
                } ${
                  activity.status === 'completed' 
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/50' 
                    : ''
                }`}
                onClick={() => setSelectedActivity(activity)}
              >
                <CardHeader className="py-4 px-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      {getActivityIcon(activity.type)}
                      <div>
                        <CardTitle className="text-base">{activity.title}</CardTitle>
                        <CardDescription className="text-xs mt-1 flex items-center gap-1">
                          <span>Posted by {activity.creator?.first_name} {activity.creator?.last_name}</span>
                          <span>•</span>
                          <span>{formatDate(activity.created_at)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    {getActivityTypeBadge(activity.type)}
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-4 pt-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{activity.description}</p>
                </CardContent>
                <CardFooter className="px-4 py-2 border-t flex justify-between items-center">
                  <Badge variant={activity.status === 'completed' ? 'outline' : 'secondary'} className="text-xs">
                    {activity.status === 'completed' ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</>
                    ) : (
                      <><Timer className="h-3 w-3 mr-1" /> Active</>
                    )}
                  </Badge>
                  {activity.due_date && (
                    <span className="text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Due: {formatDate(activity.due_date)}
                    </span>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Activities Yet</h3>
                <p className="text-gray-500 text-center mb-4">
                  Get started by creating the first activity for your squad.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Activity
                    </Button>
                  </DialogTrigger>
                  {/* Same dialog content as above */}
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Activity Details and Comments */}
        <div className="lg:col-span-4">
          {selectedActivity ? (
            <Card className="overflow-hidden flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(selectedActivity.type)}
                      <CardTitle>{selectedActivity.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {getActivityTypeBadge(selectedActivity.type)}
                      <span className="ml-2">Created on {formatDate(selectedActivity.created_at)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedActivity.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateActivityStatus(selectedActivity.id, 'completed')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateActivityStatus(selectedActivity.id, 'active')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 px-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedActivity.creator?.profile_image_url || ''} alt="Creator" />
                      <AvatarFallback>
                        {selectedActivity.creator?.first_name?.charAt(0)}
                        {selectedActivity.creator?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {selectedActivity.creator?.first_name} {selectedActivity.creator?.last_name}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <p className="whitespace-pre-line">{selectedActivity.description}</p>
                    
                    {selectedActivity.link && (
                      <div className="mt-3">
                        <a 
                          href={selectedActivity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <LinkIcon className="h-4 w-4" />
                          {selectedActivity.link}
                        </a>
                      </div>
                    )}
                    
                    {selectedActivity.due_date && (
                      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Due: {formatDate(selectedActivity.due_date)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-3">Comments</h3>
                  
                  <div className="space-y-4 max-h-72 overflow-y-auto mb-4">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={comment.author?.profile_image_url || ''} alt="Author" />
                            <AvatarFallback>
                              {comment.author?.first_name?.charAt(0)}
                              {comment.author?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{comment.author?.first_name} {comment.author?.last_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-line">{comment.content}</p>
                            <div className="mt-1">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Like
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 px-4 pb-4 border-t mt-auto">
                <div className="flex gap-2 w-full">
                  <Textarea
                    placeholder="Write a comment..."
                    className="min-h-[60px]"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        postComment();
                      }
                    }}
                  />
                  <Button 
                    className="flex-shrink-0" 
                    onClick={postComment}
                    disabled={posting || !newComment.trim()}
                  >
                    {posting ? "Posting..." : "Post"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter to post</p>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-gray-50 dark:bg-gray-800/50 h-full flex flex-col justify-center items-center py-10">
              <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">Select an Activity</h3>
              <p className="text-gray-500 text-center max-w-md mb-4">
                Choose an activity from the list to view details and comments
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
