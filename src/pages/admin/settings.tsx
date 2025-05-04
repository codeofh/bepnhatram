import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Save, Globe, Phone, Clock, MapPin, Mail, Facebook, Instagram } from "lucide-react";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { siteConfig } from "@/config/siteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToastContext } from "@/contexts/ToastContext";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const generalSettingsSchema = z.object({
  name: z.string().min(1, { message: "Tên nhà hàng không được để trống" }),
  description: z.string().min(1, { message: "Mô tả không được để trống" }),
  url: z.string().url({ message: "URL không hợp lệ" }),
  contact: z.object({
    phone: z.string().min(10, { message: "Số điện thoại không hợp lệ" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    address: z.string().min(1, { message: "Địa chỉ không được để trống" }),
    openingHours: z.string().min(1, { message: "Giờ mở cửa không được để trống" }),
    city: z.string().min(1, { message: "Thành phố không được để trống" }),
    region: z.string().min(1, { message: "Tỉnh/thành không được để trống" }),
    postalCode: z.string(),
    countryCode: z.string().min(2, { message: "Mã quốc gia không hợp lệ" })
  }),
});

const socialSettingsSchema = z.object({
  social: z.object({
    facebook: z.string().url({ message: "URL Facebook không hợp lệ" }).or(z.string().length(0)),
    facebookHandle: z.string(),
    instagram: z.string().url({ message: "URL Instagram không hợp lệ" }).or(z.string().length(0)),
    twitter: z.string().url({ message: "URL Twitter không hợp lệ" }).or(z.string().length(0)),
    zalo: z.string().url({ message: "URL Zalo không hợp lệ" }).or(z.string().length(0)),
    tiktok: z.string().url({ message: "URL TikTok không hợp lệ" }).or(z.string().length(0)),
    tiktokHandle: z.string(),
    messenger: z.string().url({ message: "URL Messenger không hợp lệ" }).or(z.string().length(0)),
  }),
  ordering: z.object({
    shopeeFood: z.string().url({ message: "URL ShopeeFood không hợp lệ" }).or(z.string().length(0)),
    grabFood: z.string().url({ message: "URL GrabFood không hợp lệ" }).or(z.string().length(0)),
  }),
});

const mapsSettingsSchema = z.object({
  maps: z.object({
    embedUrl: z.string().url({ message: "URL Google Maps không hợp lệ" }),
    directionsUrl: z.string().url({ message: "URL chỉ đường không hợp lệ" }),
    latitude: z.string(),
    longitude: z.string(),
  }),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
type SocialSettingsValues = z.infer<typeof socialSettingsSchema>;
type MapsSettingsValues = z.infer<typeof mapsSettingsSchema>;

export default function AdminSettingsPage() {
  const { user, loading } = useAdminAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToastContext();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      contact: {
        phone: siteConfig.contact.phone,
        email: siteConfig.contact.email,
        address: siteConfig.contact.address,
        openingHours: siteConfig.contact.openingHours,
        city: siteConfig.contact.city,
        region: siteConfig.contact.region,
        postalCode: siteConfig.contact.postalCode,
        countryCode: siteConfig.contact.countryCode,
      },
    },
  });

  const socialForm = useForm<SocialSettingsValues>({
    resolver: zodResolver(socialSettingsSchema),
    defaultValues: {
      social: {
        facebook: siteConfig.social.facebook,
        facebookHandle: siteConfig.social.facebookHandle,
        instagram: siteConfig.social.instagram,
        twitter: siteConfig.social.twitter,
        zalo: siteConfig.social.zalo,
        tiktok: siteConfig.social.tiktok,
        tiktokHandle: siteConfig.social.tiktokHandle,
        messenger: siteConfig.social.messenger,
      },
      ordering: {
        shopeeFood: siteConfig.ordering.shopeeFood,
        grabFood: siteConfig.ordering.grabFood,
      },
    },
  });

  const mapsForm = useForm<MapsSettingsValues>({
    resolver: zodResolver(mapsSettingsSchema),
    defaultValues: {
      maps: {
        embedUrl: siteConfig.maps.embedUrl,
        directionsUrl: siteConfig.maps.directionsUrl,
        latitude: siteConfig.maps.latitude,
        longitude: siteConfig.maps.longitude,
      },
    },
  });

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const onSubmitGeneral = (data: GeneralSettingsValues) => {
    try {
      // In a real app, this would save to a database/Firebase/environment
      console.log("General settings:", data);
      showSuccess("Đã lưu cài đặt chung thành công!");
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu cài đặt!");
    }
  };

  const onSubmitSocial = (data: SocialSettingsValues) => {
    try {
      // In a real app, this would save to a database/Firebase/environment
      console.log("Social settings:", data);
      showSuccess("Đã lưu cài đặt mạng xã hội thành công!");
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu cài đặt!");
    }
  };

  const onSubmitMaps = (data: MapsSettingsValues) => {
    try {
      // In a real app, this would save to a database/Firebase/environment
      console.log("Maps settings:", data);
      showSuccess("Đã lưu cài đặt bản đồ thành công!");
    } catch (error) {
      showError("Có lỗi xảy ra khi lưu cài đặt!");
    }
  };

  if (loading || !isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Cài đặt - {siteConfig.name} Admin</title>
        <meta name="description" content="Cài đặt trang web" />
      </Head>

      <AdminLayout title="Cài đặt">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt trang web</CardTitle>
            <CardDescription>
              Quản lý thông tin và cài đặt cho trang web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                <TabsTrigger value="social">Mạng xã hội</TabsTrigger>
                <TabsTrigger value="maps">Bản đồ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="py-4">
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên nhà hàng</FormLabel>
                            <FormControl>
                              <Input placeholder="BẾP NHÀ TRÂM" {...field} />
                            </FormControl>
                            <FormDescription>
                              Tên chính thức của nhà hàng
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website URL</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="https://bepnhatram.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả về nhà hàng"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Mô tả ngắn gọn về nhà hàng, được sử dụng cho SEO
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <h3 className="text-lg font-medium border-b pb-2 mt-8">
                      Thông tin liên hệ
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="contact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="0886286032" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="info@bepnhatram.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="contact.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Địa chỉ</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" placeholder="15/15 Đống Đa, Phú Nhuận, Huế" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="contact.openingHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giờ mở cửa</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="10:00 - 22:00 (Thứ 2 - Chủ nhật)" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thành phố</FormLabel>
                            <FormControl>
                              <Input placeholder="Huế" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={generalForm.control}
                        name="contact.region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tỉnh/Thành phố</FormLabel>
                            <FormControl>
                              <Input placeholder="Thừa Thiên Huế" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã bưu điện</FormLabel>
                            <FormControl>
                              <Input placeholder="530000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact.countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã quốc gia</FormLabel>
                            <FormControl>
                              <Input placeholder="VN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thông tin
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="social" className="py-4">
                <Form {...socialForm}>
                  <form onSubmit={socialForm.handleSubmit(onSubmitSocial)} className="space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">
                      Mạng xã hội
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="social.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="https://fb.com/bepnhatram.1" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={socialForm.control}
                        name="social.facebookHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook Handle</FormLabel>
                            <FormControl>
                              <Input placeholder="fb.com/bepnhatram.1" {...field} />
                            </FormControl>
                            <FormDescription>
                              Tên hiển thị của trang Facebook
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="social.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-10" placeholder="https://instagram.com/bepnhatram" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={socialForm.control}
                        name="social.twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/bepnhatram" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="social.tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.tiktok.com/@tramthichnauan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={socialForm.control}
                        name="social.tiktokHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok Handle</FormLabel>
                            <FormControl>
                              <Input placeholder="@tramthichnauan" {...field} />
                            </FormControl>
                            <FormDescription>
                              Tên hiển thị trên TikTok
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="social.zalo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zalo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://zalo.me/0886286032" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={socialForm.control}
                        name="social.messenger"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Messenger URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://m.me/bepnhatram.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <h3 className="text-lg font-medium border-b pb-2 mt-8">
                      Đặt hàng
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="ordering.shopeeFood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shopee Food URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://shopeefood.vn/hue/bep-nha-tram-ga-u-muoi-chan-ga" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={socialForm.control}
                        name="ordering.grabFood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grab Food URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://food.grab.com/vn/vi/restaurant/bep-nha-tram" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thông tin
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="maps" className="py-4">
                <Form {...mapsForm}>
                  <form onSubmit={mapsForm.handleSubmit(onSubmitMaps)} className="space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">
                      Cài đặt bản đồ
                    </h3>

                    <FormField
                      control={mapsForm.control}
                      name="maps.embedUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL nhúng Google Maps</FormLabel>
                          <FormControl>
                            <Textarea
                              className="font-mono text-xs"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL để nhúng bản đồ Google Maps vào trang web
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={mapsForm.control}
                      name="maps.directionsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL chỉ đường</FormLabel>
                          <FormControl>
                            <Input placeholder="https://maps.app.goo.gl/oSWx2zEwL6VCU4Hf7" {...field} />
                          </FormControl>
                          <FormDescription>
                            Liên kết để dẫn đến chỉ đường trên Google Maps
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={mapsForm.control}
                        name="maps.latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vĩ độ (Latitude)</FormLabel>
                            <FormControl>
                              <Input placeholder="16.462158199999998" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mapsForm.control}
                        name="maps.longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kinh độ (Longitude)</FormLabel>
                            <FormControl>
                              <Input placeholder="107.59194319999999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-6 border rounded-lg overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={mapsForm.watch("maps.embedUrl")}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thông tin
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}