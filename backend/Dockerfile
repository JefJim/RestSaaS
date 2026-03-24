FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/RestSaaS.Api/RestSaaS.Api.csproj", "RestSaaS.Api/"]
COPY ["src/RestSaaS.Core/RestSaaS.Core.csproj", "RestSaaS.Core/"]
COPY ["src/RestSaaS.Infrastructure/RestSaaS.Infrastructure.csproj", "RestSaaS.Infrastructure/"]
RUN dotnet restore "RestSaaS.Api/RestSaaS.Api.csproj"

# Copy the remaining source code
COPY src/ .
WORKDIR "/src/RestSaaS.Api"
RUN dotnet build "RestSaaS.Api.csproj" -c Release -o /app/build
RUN dotnet publish "RestSaaS.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "RestSaaS.Api.dll"]
