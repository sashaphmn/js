/* eslint-disable @next/next/no-img-element */
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Button } from "@/components/ui/button";
import { Divider, Flex, GridItem, SimpleGrid } from "@chakra-ui/react";
import { useAllVersions, useEns } from "components/contract-components/hooks";
import { PublishedContract } from "components/contract-components/published-contract";
import { useTrack } from "hooks/analytics/useTrack";
import { replaceIpfsUrl } from "lib/sdk";
import { ChevronsRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { ContractDeployForm } from "../contract-components/contract-deploy-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "../../@/components/blocks/Sidebar";
import { shareLink } from "../../@/lib/shareLink";

export interface PublishWithVersionPageProps {
  author: string;
  contractName: string;
  version: string;
  isDeploy: boolean;
}

export const PublishWithVersionPage: React.FC<PublishWithVersionPageProps> = ({
  author,
  contractName,
  version: _version,
  isDeploy,
}) => {
  const ensQuery = useEns(author);
  const allVersions = useAllVersions(
    ensQuery.data?.address || undefined,
    contractName,
  );

  const availableVersions = allVersions.data?.map(({ version: v }) => v) || [];
  const version = _version || availableVersions[0];
  const trackEvent = useTrack();
  const router = useRouter();

  const publishedContract = useMemo(() => {
    return (
      allVersions.data?.find((v) => v.version === version) ||
      allVersions.data?.[0]
    );
  }, [allVersions?.data, version]);

  const deployContractId = publishedContract?.metadataUri.replace(
    "ipfs://",
    "",
  );

  const contractNameDisplay =
    publishedContract?.displayName || publishedContract?.name;

  const versionSelector = (
    <Select
      value={version}
      onValueChange={(val) => {
        if (availableVersions.includes(val)) {
          trackEvent({
            category: "release-selector",
            action: "click",
            version_selected: val,
          });

          const pathName =
            val === allVersions.data?.[0].version
              ? `/${author}/${contractName}`
              : `/${author}/${contractName}/${val}`;

          if (isDeploy) {
            router.push(`${pathName}/deploy`);
          } else {
            router.push(pathName);
          }
        }
      }}
    >
      <SelectTrigger className="min-w-[180px] bg-transparent hover:bg-accent">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableVersions.map((v, idx) => {
          return (
            <SelectItem value={v} key={v}>
              {v}
              {idx === 0 && (
                <span className="text-muted-foreground"> (latest) </span>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const contractInfo = (
    <div className="flex gap-4 items-center flex-1">
      {publishedContract?.logo && (
        <div className="rounded-xl p-2 border border-border shrink-0 items-center justify-center hidden md:flex">
          <img
            className="size-12"
            alt={publishedContract.name}
            src={replaceIpfsUrl(publishedContract.logo)}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {contractNameDisplay}
        </h1>
        <p className="text-muted-foreground text-sm">
          {publishedContract?.description}
        </p>
      </div>
    </div>
  );

  if (isDeploy) {
    const showLoading = !deployContractId || !publishedContract;
    return (
      <div className="flex gap-2">
        {/* Left */}
        <Sidebar
          header={<div className="font-semibold text-lg mb-4">Contracts</div>}
          links={[
            { href: "/dashboard/contracts/deploy", label: "Deploy" },
            {
              href: "/dashboard/contracts/publish",
              label: "Publish",
            },
            {
              href: "/explore",
              label: "Explore",
            },
            {
              href: "/trending",
              label: "Trending",
            },
            { href: "/dashboard/contracts/build", label: "Build" },
          ]}
        />

        {/* Right */}
        <div className="flex-1">
          {/* header */}
          <div className="py-6 border-b border-border md:py-12">
            <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
              {contractInfo}
              <div className="flex flex-col-reverse  md:flex-row gap-3">
                {versionSelector}
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link
                      href={`${router.asPath.replace("/deploy", "")}`}
                      target="_blank"
                    >
                      Contract
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      shareLink({
                        title: `Deploy ${contractNameDisplay}`,
                      });
                    }}
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-6 md:pt-10">
            {showLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Spinner className="size-10" />
              </div>
            ) : (
              <ContractDeployForm
                contractId={deployContractId}
                version={publishedContract.version || "latest"}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Flex direction="column" gap={{ base: 6, md: 10 }}>
      {/* Header */}
      <div className="py-2 md:pt-8 md:pb-0">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {contractInfo}
          <div className="flex gap-3">
            {versionSelector}
            <Button asChild variant="primary" className="gap-2">
              <Link href={`${router.asPath}/deploy`}>
                Deploy Now
                <ChevronsRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <SimpleGrid columns={12} gap={{ base: 6, md: 10 }} w="full">
        <GridItem colSpan={12} display={{ base: "inherit", md: "none" }}>
          <Divider />
        </GridItem>
        {publishedContract && (
          <PublishedContract
            contract={publishedContract}
            walletOrEns={author}
          />
        )}
      </SimpleGrid>
    </Flex>
  );
};
