import Shell from "@calcom/features/shell/Shell";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { SkeletonLoader, List, ListItemTitle, ListItemText, ListItem } from "@calcom/ui";
import { FiLink } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

export default function Customers() {
  const { t } = useLocale();
  const WithQuery = withQuery(trpc.viewer.customers.myCustomers);

  return (
    <Shell
      heading={t("lb_customer_list_title")}
      title={t("lb_customer_list_title")}
      subtitle={t("lb_customer_list_subtitle")}>
      <WithQuery
        customLoader={<SkeletonLoader />}
        success={({ data: customers }) => {
          return (
            <List className="border-none" role="list">
              {customers.map((customer) => {
                return (
                  <ListItem
                    className="border-brand-300 flex content-center justify-between rounded-2xl md:p-10"
                    key={customer.email}>
                    <div className="flex flex-row">
                      <img
                        className="mr-2 h-10 w-10 rounded-full"
                        src="https://picsum.photos/200/300"
                        alt={customer.name}
                      />
                      <div className="flex flex-col content-start">
                        <ListItemTitle>{customer.name}</ListItemTitle>
                        <ListItemText>{customer.email}</ListItemText>
                      </div>
                    </div>
                    <div className="border-brand-200 rounded-lg border-2 p-1">
                      <FiLink className="text-brand-500 text-3xl font-bold" />
                    </div>
                  </ListItem>
                );
              })}
            </List>
          );
        }}
      />
    </Shell>
  );
}
