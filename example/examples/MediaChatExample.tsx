import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chat } from '../../src/components/Chat';
import type { Message, MediaItem } from '../../src/components/Chat';
import { addMinutes } from 'date-fns';

/**
 * MediaChatExample - Simulates a group chat where team members collaborate on media content
 * Shows all different media types (image, gif, video, audio) in chat context
 */

const MediaChatExample: React.FC = () => {
  // Sample media items for the chat
  const mountainImage: MediaItem = {
    id: 'img-mountains',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    title: 'Hero Image - Mountain Landscape',
    caption: 'Final edited version with color correction',
    metadata: {
      fileName: 'hero-mountains-final.jpg',
      fileSize: 2457600,
      width: 4000,
      height: 2667,
      format: 'jpeg',
    },
    tags: ['hero', 'landscape', 'approved'],
    author: 'Sarah Chen',
  };

  const forestImage: MediaItem = {
    id: 'img-forest',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    title: 'Background Image - Forest',
    caption: 'Option 2 for the nature section',
    metadata: {
      fileName: 'forest-path-v2.jpg',
      fileSize: 1843200,
      width: 3000,
      height: 2000,
      format: 'jpeg',
    },
    tags: ['background', 'nature', 'review'],
    author: 'Sarah Chen',
  };

  const loadingGif: MediaItem = {
    id: 'gif-loading',
    type: 'gif',
    url: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    thumbnailUrl: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/200.gif',
    title: 'Loading Animation',
    caption: 'New spinner design for the app',
    isAnimated: true,
    autoPlay: true,
    loop: true,
    metadata: {
      fileName: 'loading-spinner-v3.gif',
      fileSize: 524288,
      width: 480,
      height: 270,
      duration: 2.5,
      format: 'gif',
    },
    tags: ['animation', 'ui', 'loading'],
    author: 'Mike Rodriguez',
  };

  const promoVideo: MediaItem = {
    id: 'vid-promo',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    title: 'Product Demo Video - Draft',
    caption: 'First cut of the promo video, needs feedback',
    summary: 'Initial edit of the product demonstration video for the marketing campaign',
    metadata: {
      fileName: 'product-promo-draft-v1.mp4',
      fileSize: 158008374,
      width: 1920,
      height: 1080,
      duration: 596,
      frameRate: 24,
      format: 'mp4',
    },
    tags: ['video', 'promo', 'draft', 'needs-review'],
    author: 'Alex Kim',
  };

  const tutorialVideo: MediaItem = {
    id: 'vid-tutorial',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'Tutorial Video - Final',
    caption: 'Approved tutorial for documentation',
    metadata: {
      fileName: 'tutorial-getting-started.mp4',
      fileSize: 142606336,
      width: 1920,
      height: 1080,
      duration: 654,
      format: 'mp4',
    },
    tags: ['tutorial', 'documentation', 'approved'],
    author: 'Alex Kim',
  };

  const podcastAudio: MediaItem = {
    id: 'aud-podcast',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Podcast Episode 12 - Intro Music',
    caption: 'Background music for the new podcast episode',
    summary: 'Royalty-free music track for podcast introduction',
    metadata: {
      fileName: 'podcast-ep12-intro.mp3',
      fileSize: 4718592,
      duration: 294,
      bitrate: 128,
      format: 'mp3',
    },
    tags: ['audio', 'podcast', 'music', 'intro'],
    author: 'Jamie Foster',
  };

  const mediaGallery: MediaItem[] = [
    {
      id: 'gallery-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      title: 'Mountain Peak',
      caption: 'Option A',
      metadata: { width: 4000, height: 2667 },
      tags: ['campaign', 'option-a'],
    },
    {
      id: 'gallery-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      title: 'Forest Path',
      caption: 'Option B',
      metadata: { width: 3000, height: 2000 },
      tags: ['campaign', 'option-b'],
    },
    {
      id: 'gallery-3',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
      title: 'Northern Lights',
      caption: 'Option C',
      metadata: { width: 3500, height: 2333 },
      tags: ['campaign', 'option-c'],
    },
    {
      id: 'gallery-4',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
      title: 'Lake Reflection',
      caption: 'Option D',
      metadata: { width: 4200, height: 2800 },
      tags: ['campaign', 'option-d'],
    },
  ];

  const messages: Message[] = [
    {
      id: 'msg-1',
      content: 'Hey team! Starting the media review thread for the new campaign. Let me share what we have so far.',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -45),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-2',
      content: 'Here\'s the hero image I finished editing. Color corrected and ready for approval.',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -44),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: mountainImage,
          mode: 'full',
          showCaption: true,
          showMetadata: false,
        },
      },
    },
    {
      id: 'msg-3',
      content: 'That looks amazing! The color grading is perfect. What about the alternate option?',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -42),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-4',
      content: 'Here\'s the forest shot as an alternative. Which do you prefer?',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -41),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: forestImage,
          mode: 'full',
          showCaption: true,
          showMetadata: false,
        },
      },
    },
    {
      id: 'msg-5',
      content: 'I think the mountain shot is stronger for the hero. Let\'s use it! 🎯',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -38),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-6',
      content: 'Quick update on the UI animations. I redesigned the loading spinner - check it out!',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -35),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: loadingGif,
          mode: 'full',
          showCaption: true,
          maxHeight: 250,
        },
      },
    },
    {
      id: 'msg-7',
      content: 'Smooth! Much better than the old one. Approved ✓',
      sender: { id: 'user-alex', name: 'Alex Kim', avatar: '🎬' },
      timestamp: addMinutes(new Date(), -33),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-8',
      content: 'Video update: I just finished the first cut of the promo video. It\'s about 10 minutes - needs trimming but wanted to share the rough draft.',
      sender: { id: 'user-alex', name: 'Alex Kim', avatar: '🎬' },
      timestamp: addMinutes(new Date(), -30),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: promoVideo,
          mode: 'full',
          showCaption: true,
          showMetadata: true,
        },
      },
    },
    {
      id: 'msg-9',
      content: 'The opening sequence is great! But yeah, we need to cut it down to 2-3 minutes for social media.',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -27),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-10',
      content: 'Agreed. I\'ll create a shorter cut focusing on the key features. Also uploading the tutorial video that was approved:',
      sender: { id: 'user-alex', name: 'Alex Kim', avatar: '🎬' },
      timestamp: addMinutes(new Date(), -25),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: tutorialVideo,
          mode: 'mini',
          showCaption: true,
        },
      },
    },
    {
      id: 'msg-11',
      content: 'Perfect! That one\'s good to go live on the docs site.',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -23),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-12',
      content: 'Audio update from my end! Here\'s the intro music for the podcast episode. Let me know if it fits the vibe.',
      sender: { id: 'user-jamie', name: 'Jamie Foster', avatar: '🎙️' },
      timestamp: addMinutes(new Date(), -20),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: podcastAudio,
          mode: 'full',
          showCaption: true,
          showMetadata: true,
        },
      },
    },
    {
      id: 'msg-13',
      content: 'Love the energy! Very upbeat. Perfect for an intro track.',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -18),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-14',
      content: 'Thanks everyone! One more thing - I put together a gallery of all our top campaign image candidates. Can you vote on your favorites?',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -15),
      status: 'delivered',
      isOwn: false,
      interactiveComponent: {
        type: 'media',
        data: {
          media: mediaGallery,
          mode: 'full',
          showCaption: true,
          gallery: {
            showThumbnails: true,
            enableSwipe: true,
            showIndicators: true,
          },
        },
      },
    },
    {
      id: 'msg-15',
      content: 'My votes: A for hero, D for the background section. The lake reflection would look great in the footer!',
      sender: { id: 'user-alex', name: 'Alex Kim', avatar: '🎬' },
      timestamp: addMinutes(new Date(), -12),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-16',
      content: 'I\'m with Alex. A and D are the strongest. The Northern Lights (C) could work for the premium tier announcement?',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -10),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-17',
      content: 'Great feedback everyone! I\'ll update the asset tracker and mark these as approved. Jamie, can you send the final audio mix when ready?',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -8),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-18',
      content: 'Will do! I\'ll have the final mix with fade-in/out by end of day.',
      sender: { id: 'user-jamie', name: 'Jamie Foster', avatar: '🎙️' },
      timestamp: addMinutes(new Date(), -6),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-19',
      content: 'Awesome work team! This campaign is coming together nicely. All media assets looking 🔥',
      sender: { id: 'user-mike', name: 'Mike Rodriguez', avatar: '🧑‍💼' },
      timestamp: addMinutes(new Date(), -3),
      status: 'delivered',
      isOwn: false,
    },
    {
      id: 'msg-20',
      content: 'Thanks everyone! Let\'s sync tomorrow morning to finalize the timeline.',
      sender: { id: 'user-sarah', name: 'Sarah Chen', avatar: '👩‍🎨' },
      timestamp: addMinutes(new Date(), -1),
      status: 'delivered',
      isOwn: false,
    },
  ];

  const [chatMessages, setChatMessages] = useState<Message[]>(messages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: { id: 'user-you', name: 'You', avatar: '👤' },
      timestamp: new Date(),
      status: 'sending',
      isOwn: true,
    };
    setChatMessages([...chatMessages, newMessage]);

    // Simulate message delivery
    setTimeout(() => {
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
        )
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Chat
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        placeholder="Share media or send a message..."
        currentUserId="user-you"
        title="Creative Team - Campaign Assets"
        subtitle="Sarah, Mike, Alex, Jamie, You"
        showTypingIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

export default MediaChatExample;
